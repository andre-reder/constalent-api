import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import admin from 'firebase-admin';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { CompaniesRepository } from 'src/shared/database/repositories/companies.repository';
import { UsersRepository } from 'src/shared/database/repositories/users.repository';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly companiesRepo: CompaniesRepository,
  ) {}

  private async checkIfEmailAlreadyExists(email: string) {
    const emailsList = (await this.usersRepo.findMany({})).map(
      (usr) => usr.email,
    );

    if (emailsList.includes(email)) {
      throw new ConflictException('This email is already in use');
    }
  }

  async findAll() {
    try {
      const companies = await this.companiesRepo.findMany({});

      return { success: true, companies };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async findOne(userId: string, id: string) {
    try {
      const user = await this.usersRepo.findUnique({ where: { id: userId } });

      if (user.role !== 'admin' && user.companyId !== id) {
        throw new UnauthorizedException('You do not have permission to access');
      }

      const company = this.companiesRepo.findUnique({ where: { id } });

      return { success: true, company };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async create(createCompanyDto: CreateCompanyDto) {
    try {
      const { userLoginEmail, userFirstPassword, ...companyData } =
        createCompanyDto;

      const willCreateUser = userLoginEmail && userFirstPassword;

      let authId: string;

      if (willCreateUser) {
        await this.checkIfEmailAlreadyExists(userLoginEmail);

        const auth = getAuth();
        const user = await createUserWithEmailAndPassword(
          auth,
          userLoginEmail,
          userFirstPassword,
        );

        authId = user?.user?.uid;

        if (!authId) {
          throw new InternalServerErrorException('Error creating user');
        }
      }

      const company = await this.companiesRepo.create({
        data: { ...companyData },
      });

      if (willCreateUser) {
        await this.usersRepo.create({
          data: {
            companyId: company.id,
            authId,
            email: userLoginEmail,
            role: 'customer',
            name: companyData.contactName,
          },
        });
      }

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    try {
      const { cnpj } = updateCompanyDto;

      if (cnpj) {
        const companyWithSameCnpj = await this.companiesRepo.findUnique({
          where: { cnpj },
        });

        if (companyWithSameCnpj && companyWithSameCnpj.id !== id) {
          throw new ConflictException('This CNPJ is already in use');
        }
      }

      await this.companiesRepo.update({
        where: { id },
        data: { ...updateCompanyDto },
      });

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    try {
      const user = await this.usersRepo.findUnique({ where: { id: userId } });

      if (user.role !== 'admin' || user.companyId !== id) {
        throw new UnauthorizedException('You do not have permission to access');
      }

      const companyDetails = await this.companiesRepo.findUnique({
        where: { id },
        include: { users: true, candidates: true },
      });

      if (companyDetails.users.length >= 1) {
        const usersAuthIds = companyDetails.users.map((usr) => usr.authId);

        const firebaseApp = admin.auth();

        const functionsToRemoveFromFirebase = usersAuthIds.map((authId) =>
          (async () => {
            await firebaseApp.deleteUser(authId);
          })(),
        );

        await Promise.all(functionsToRemoveFromFirebase);
      }

      if (companyDetails.candidates.length >= 1) {
        const candidatesResumes = companyDetails.candidates.map(
          (x) => x.resume,
        );

        const functionsToRemoveResumesFromFirebase = candidatesResumes.map(
          (resume) =>
            (async () => {
              if (!resume) return;

              const pathToResume = resume
                .split('appspot.com/')[1]
                .split('?')[0];
              const pathToResumeSplit = pathToResume.split('/');

              const resumeFileName = decodeURIComponent(
                pathToResumeSplit.pop(),
              );
              const pathToResumeFolder = pathToResumeSplit.join('/');

              const fullPathToResumeFile = `${pathToResumeFolder}/${resumeFileName}`;

              const storage = getStorage();
              const resumeRef = ref(storage, fullPathToResumeFile);

              await deleteObject(resumeRef);
            })(),
        );

        await Promise.all(functionsToRemoveResumesFromFirebase);
      }

      await this.companiesRepo.delete({ where: { id } });

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }
}
