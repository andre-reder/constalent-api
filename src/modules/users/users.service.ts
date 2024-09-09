import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import admin from 'firebase-admin';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { CompaniesRepository } from 'src/shared/database/repositories/companies.repository';
import { UsersRepository } from 'src/shared/database/repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
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

  async findAll(userId: string) {
    try {
      const userDetails = await this.usersRepo.findUnique({
        where: { id: userId },
        include: { company: { select: { name: true, id: true } } },
      });

      const allUsers = await this.usersRepo.findMany({
        ...(userDetails.role !== 'admin'
          ? {
              where: { companyId: userDetails.companyId },
            }
          : {}),
        include: { company: { select: { name: true, id: true } } },
      });

      return { success: true, users: allUsers };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async findOne(userId: string, id: string) {
    try {
      const getUserDetails = async () =>
        await this.usersRepo.findUnique({
          where: { id: userId },
        });

      const getUserToBeReturned = async () =>
        await this.usersRepo.findUnique({
          where: { id },
          include: { company: { select: { id: true, name: true } } },
        });

      const [userDetails, userToBeReturned] = await Promise.all([
        getUserDetails(),
        getUserToBeReturned(),
      ]);

      if (
        userDetails.role !== 'admin' &&
        userDetails.companyId !== userToBeReturned.companyId
      ) {
        throw new UnauthorizedException(
          'You are not authorized to perform this action',
        );
      }

      return { success: true, user: userToBeReturned };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async create(userId: string, createUserDto: CreateUserDto) {
    try {
      const userDetails = await this.usersRepo.findUnique({
        where: { id: userId },
      });

      if (
        userDetails.role !== 'admin' &&
        userDetails.companyId !== createUserDto.companyId
      ) {
        throw new Error('You are not authorized to perform this action');
      }

      const { email, password, companyId, ...rest } = createUserDto;
      await this.checkIfEmailAlreadyExists(email);
      const auth = getAuth();
      const user = await createUserWithEmailAndPassword(auth, email, password);
      const userAuthId = user?.user?.uid;

      if (!userAuthId) {
        throw new InternalServerErrorException('Failed to create user');
      }

      await this.usersRepo.create({
        data: {
          ...rest,
          email,
          authId: userAuthId,
          ...(companyId ? { company: { connect: { id: companyId } } } : {}),
        },
      });

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async update(userId: string, id: string, updateUserDto: UpdateUserDto) {
    try {
      const userDetails = await this.usersRepo.findUnique({
        where: { id: userId },
      });

      const { role } = updateUserDto;

      if (
        userDetails.role !== 'admin' &&
        (role === 'admin' || userDetails.companyId !== updateUserDto.companyId)
      ) {
        throw new Error('You are not authorized to perform this action');
      }

      await this.usersRepo.update({
        where: { id },
        data: updateUserDto,
      });

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    try {
      const getUserDetails = async () =>
        await this.usersRepo.findUnique({
          where: { id: userId },
        });

      const getUserToBeRemoved = async () =>
        await this.usersRepo.findUnique({
          where: { id },
        });

      const [userDetails, userToBeRemoved] = await Promise.all([
        getUserDetails(),
        getUserToBeRemoved(),
      ]);

      if (userDetails.id === userToBeRemoved.id) {
        throw new BadRequestException('You cannot remove yourself');
      }

      const isUserAdmin = userDetails.role === 'admin';
      const areUsersInSameCompany =
        userDetails.companyId === userToBeRemoved.companyId;

      if (!isUserAdmin && !areUsersInSameCompany) {
        throw new UnauthorizedException(
          'You are not authorized to perform this action',
        );
      }

      const totalUsersInCompanyOfUserBeingRemoved =
        await this.usersRepo.findMany({
          where: { companyId: userToBeRemoved.companyId },
        });

      if (totalUsersInCompanyOfUserBeingRemoved.length === 1) {
        throw new BadRequestException(
          'You cannot remove the last user of a company',
        );
      }

      const authId = userToBeRemoved.authId;
      const firebaseApp = admin.auth();
      await firebaseApp.deleteUser(authId);

      await this.usersRepo.delete({ where: { id } });

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }
}
