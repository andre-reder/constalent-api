import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { CandidatesRepository } from 'src/shared/database/repositories/candidates.repository';
import { UsersRepository } from 'src/shared/database/repositories/users.repository';
import { VacanciesRepository } from 'src/shared/database/repositories/vacancies.repository';
import removeFileFirebase from 'src/shared/utils/removeFileFirebase';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(
    private readonly candidatesRepo: CandidatesRepository,
    private readonly vacanciesRepo: VacanciesRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async findAll(userId: string) {
    try {
      const userDetails = await this.usersRepo.findUnique({
        where: { id: userId },
      });

      const allCandidates = await this.candidatesRepo.findMany({
        ...(userDetails.role === 'admin'
          ? {}
          : {
              where: {
                applications: { some: { companyId: userDetails.companyId } },
              },
            }),
      });

      return { success: true, candidates: allCandidates };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async findOne(userId: string, id: string) {
    try {
      const getUser = async () =>
        await this.usersRepo.findUnique({
          where: { id: userId },
        });

      const getCandidate = async () =>
        await this.candidatesRepo.findUnique({
          where: { id },
          include: { applications: { select: { companyId: true } } },
        });

      const [userDetails, candidate] = await Promise.all([
        getUser(),
        getCandidate(),
      ]);

      if (
        userDetails.role === 'customer' &&
        candidate.applications.every(
          (x) => x.companyId !== userDetails.companyId,
        )
      ) {
        throw new UnauthorizedException(
          'You are not allowed to access this resource',
        );
      }

      return { success: true, candidate };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async findAllByVacancy(userId: string, id: string) {
    try {
      const userDetails = await this.usersRepo.findUnique({
        where: { id: userId },
      });

      const { role, companyId } = userDetails;

      const candidates = await this.candidatesRepo.findMany({
        where: {
          applications: {
            some: {
              vacancyId: id,
              ...(role === 'customer' ? { companyId } : {}),
            },
          },
        },
        include: {
          interviews: {
            select: { id: true, status: true, type: true, date: true },
          },
          applications: {
            select: { id: true, status: true, date: true },
          },
        },
      });

      return { success: true, candidates };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async create(
    createCandidateDto: CreateCandidateDto,
    files: {
      resume: Express.Multer.File[];
      psycologicalTest: Express.Multer.File[];
      candidatesForm: Express.Multer.File[];
    },
  ) {
    let psycologicalTestUrl = '';
    let candidatesFormUrl = '';
    let resumeUrl = '';
    try {
      const { email, cpf, rg } = createCandidateDto;

      const candidatesWithSameUniqueFields = await this.candidatesRepo.findMany(
        {
          where: {
            OR: [{ email }, { cpf }, { rg }],
          },
        },
      );

      if (
        !!candidatesWithSameUniqueFields &&
        candidatesWithSameUniqueFields.length > 0
      ) {
        throw new ConflictException(
          'User with same unique fields already exists',
        );
      }

      const { resume, psycologicalTest, candidatesForm } = files;

      const resumeStorageRef = ref(
        getStorage(),
        `candidates-files/${cpf}/resume/${resume[0].originalname}`,
      );
      const resumeSnapshot = await uploadBytes(
        resumeStorageRef,
        Buffer.from(resume[0].buffer),
      );
      resumeUrl = await getDownloadURL(resumeSnapshot.ref);

      if (psycologicalTest && psycologicalTest[0]) {
        const psycologicalTestStorageRef = ref(
          getStorage(),
          `candidates-files/${cpf}/psycological-test/${psycologicalTest[0].originalname}`,
        );
        const psycologicalTestSnapshot = await uploadBytes(
          psycologicalTestStorageRef,
          Buffer.from(psycologicalTest[0].buffer),
        );
        psycologicalTestUrl = await getDownloadURL(
          psycologicalTestSnapshot.ref,
        );
      }

      if (candidatesForm && candidatesForm[0]) {
        const candidatesFormStorageRef = ref(
          getStorage(),
          `candidates-files/${cpf}/candidates-form/${candidatesForm[0].originalname}`,
        );
        const candidatesFormSnapshot = await uploadBytes(
          candidatesFormStorageRef,
          Buffer.from(candidatesForm[0].buffer),
        );
        candidatesFormUrl = await getDownloadURL(candidatesFormSnapshot.ref);
      }

      const transformedCreateCandidateDto = plainToClass(
        CreateCandidateDto,
        createCandidateDto,
      );

      await this.candidatesRepo.create({
        data: {
          ...transformedCreateCandidateDto,
          resume: resumeUrl,
          psycologicalTest: psycologicalTestUrl,
          candidatesForm: candidatesFormUrl,
          createdAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      console.log(error);
      await Promise.all([
        removeFileFirebase(resumeUrl),
        ...(psycologicalTestUrl
          ? [removeFileFirebase(psycologicalTestUrl)]
          : []),
        ...(candidatesFormUrl ? [removeFileFirebase(candidatesFormUrl)] : []),
      ]);
      error.success = false;
      throw error;
    }
  }

  async update(
    id: string,
    updateCandidateDto: UpdateCandidateDto,
    files: {
      resume: Express.Multer.File[];
      psycologicalTest: Express.Multer.File[];
      candidatesForm: Express.Multer.File[];
    },
  ) {
    let psycologicalTestUrl = '';
    let candidatesFormUrl = '';
    let resumeUrl = '';
    try {
      const currentCandidate = await this.candidatesRepo.findUnique({
        where: { id },
      });

      const { resume, psycologicalTest, candidatesForm } = files;
      const { cpf } = updateCandidateDto;

      if (!(typeof resume === 'string')) {
        await removeFileFirebase(currentCandidate.resume);
        const resumeStorageRef = ref(
          getStorage(),
          `candidates-files/${cpf}/resume/${resume[0].originalname}`,
        );
        const resumeSnapshot = await uploadBytes(
          resumeStorageRef,
          Buffer.from(resume[0].buffer),
        );
        resumeUrl = await getDownloadURL(resumeSnapshot.ref);
      } else {
        resumeUrl = currentCandidate.resume;
      }

      if (
        psycologicalTest &&
        !(typeof psycologicalTest === 'string') &&
        psycologicalTest[0]
      ) {
        await removeFileFirebase(currentCandidate.psycologicalTest);
        const psycologicalTestStorageRef = ref(
          getStorage(),
          `candidates-files/${cpf}/psycological-test/${psycologicalTest[0].originalname}`,
        );
        const psycologicalTestSnapshot = await uploadBytes(
          psycologicalTestStorageRef,
          Buffer.from(psycologicalTest[0].buffer),
        );
        psycologicalTestUrl = await getDownloadURL(
          psycologicalTestSnapshot.ref,
        );
      } else {
        psycologicalTestUrl = currentCandidate.psycologicalTest;
      }

      if (
        candidatesForm &&
        !(typeof candidatesForm === 'string') &&
        candidatesForm[0]
      ) {
        await removeFileFirebase(currentCandidate.candidatesForm);
        const candidatesFormStorageRef = ref(
          getStorage(),
          `candidates-files/${cpf}/candidates-form/${candidatesForm[0].originalname}`,
        );
        const candidatesFormSnapshot = await uploadBytes(
          candidatesFormStorageRef,
          Buffer.from(candidatesForm[0].buffer),
        );
        candidatesFormUrl = await getDownloadURL(candidatesFormSnapshot.ref);
      } else {
        candidatesFormUrl = currentCandidate.candidatesForm;
      }

      const transformedUpdateCandidateDto = plainToClass(
        UpdateCandidateDto,
        updateCandidateDto,
      );

      await this.candidatesRepo.update({
        where: { id },
        data: {
          ...transformedUpdateCandidateDto,
          resume: resumeUrl,
          psycologicalTest: psycologicalTestUrl,
          candidatesForm: candidatesFormUrl,
        },
      });

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const candidateBeingDeleted = await this.candidatesRepo.findUnique({
        where: { id },
      });

      const { resume, psycologicalTest, candidatesForm } =
        candidateBeingDeleted;

      await Promise.all([
        removeFileFirebase(resume),
        ...(psycologicalTest ? [removeFileFirebase(psycologicalTest)] : []),
        ...(candidatesForm ? [removeFileFirebase(candidatesForm)] : []),
      ]);

      await this.candidatesRepo.delete({ where: { id } });

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }
}
