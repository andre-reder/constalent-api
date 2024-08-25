import { Injectable, UnauthorizedException } from '@nestjs/common';
import { isAfter } from 'date-fns';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { CandidatesRepository } from 'src/shared/database/repositories/candidates.repository';
import { UsersRepository } from 'src/shared/database/repositories/users.repository';
import { VacanciesRepository } from 'src/shared/database/repositories/vacancies.repository';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';

@Injectable()
export class VacanciesService {
  constructor(
    private readonly vacanciesRepo: VacanciesRepository,
    private readonly usersRepo: UsersRepository,
    private readonly candidatesRepo: CandidatesRepository,
  ) {}

  async findAll(userId: string) {
    try {
      const userDetails = await this.usersRepo.findUnique({
        where: { id: userId },
      });

      const vacancies = await this.vacanciesRepo.findMany({
        ...(userDetails.role === 'customer'
          ? { where: { companyId: userDetails.companyId } }
          : {}),
      });

      return { success: true, vacancies };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async findOne(userId: string, id: string) {
    try {
      const userDetails = await this.usersRepo.findUnique({
        where: { id: userId },
      });

      const vacancy = await this.vacanciesRepo.findUnique({
        where: { id },
      });

      if (
        userDetails.role === 'customer' &&
        userDetails.companyId !== vacancy.companyId
      ) {
        throw new UnauthorizedException(
          'You are not allowed to access this vacancy',
        );
      }

      return { success: true, vacancy };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async create(userId: string, createVacancyDto: CreateVacancyDto) {
    try {
      const userDetails = await this.usersRepo.findUnique({
        where: { id: userId },
      });

      const { role, companyId: userCompanyId } = userDetails;

      if (role !== 'admin' && userCompanyId !== createVacancyDto.companyId) {
        throw new UnauthorizedException(
          'You are not allowed to create vacancies for this company',
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { companyId, ...rest } = createVacancyDto;

      await this.vacanciesRepo.create({
        data: {
          ...rest,
          status: 'waiting',
          createdAt: new Date(),
          company: {
            connect: { id: createVacancyDto.companyId },
          },
        },
      });
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async update(userId: string, id: string, updateVacancyDto: UpdateVacancyDto) {
    try {
      const userDetails = await this.usersRepo.findUnique({
        where: { id: userId },
      });

      const { role, companyId } = userDetails;

      if (role === 'customer' && companyId !== updateVacancyDto.companyId) {
        throw new UnauthorizedException(
          'You are not allowed to update vacancies for this company',
        );
      }

      const vacancy = await this.vacanciesRepo.findUnique({
        where: { id },
      });

      const { status: currentStatus } = vacancy;
      const { status: newStatus } = updateVacancyDto;
      const isChangingStatus = currentStatus !== newStatus;

      if (isChangingStatus && role === 'customer' && newStatus === 'open') {
        throw new UnauthorizedException(
          'You are not allowed to open a vacancy',
        );
      }

      const isReopeningVacancy = isChangingStatus && newStatus === 'waiting';
      const isOpeningVacancy = isChangingStatus && newStatus === 'open';
      const isCancellingVacancy = isChangingStatus && newStatus === 'canceled';
      const isFinishingVacancy = isChangingStatus && newStatus === 'finished';

      const hiredCandidates = await this.candidatesRepo.findMany({
        where: { vacancyId: id, status: 'hired' },
      });

      const canFinishVacancy =
        hiredCandidates.length >= vacancy.vacanciesAmount;

      if (isFinishingVacancy && !canFinishVacancy) {
        throw new UnauthorizedException(
          'You cannot finish a vacancy without hiring the necessary amount of candidates',
        );
      }

      const canCancelVacancy = hiredCandidates.length === 0;

      if (isCancellingVacancy && !canCancelVacancy) {
        throw new UnauthorizedException(
          'You cannot cancel a vacancy with hired candidates',
        );
      }

      const canOpenVacancy =
        vacancy.alignmentMeetingDate &&
        isAfter(new Date(), vacancy.alignmentMeetingDate);

      if (isOpeningVacancy && !canOpenVacancy) {
        throw new UnauthorizedException(
          'You cannot open a vacancy before the alignment meeting date',
        );
      }

      const canReopenVacancy = currentStatus === 'canceled';

      if (isReopeningVacancy && !canReopenVacancy) {
        throw new UnauthorizedException(
          'You cannot reopen a vacancy that is not canceled',
        );
      }

      await this.vacanciesRepo.update({
        where: { id },
        data: {
          ...updateVacancyDto,
          ...(isOpeningVacancy
            ? {
                openedAt: new Date(),
                finishedAt: undefined,
                canceledAt: undefined,
              }
            : {}),
          ...(isReopeningVacancy
            ? {
                openedAt: new Date(),
                finishedAt: undefined,
                canceledAt: undefined,
              }
            : {}),
          ...(isCancellingVacancy
            ? {
                canceledAt: new Date(),
              }
            : {}),
          ...(isFinishingVacancy
            ? {
                finishedAt: new Date(),
                canceledAt: undefined,
              }
            : {}),
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
      const vacancyDetails = await this.vacanciesRepo.findUnique({
        where: { id },
        include: {
          candidates: { select: { resume: true } },
        },
      });

      if (vacancyDetails.candidates.length >= 1) {
        const candidatesResumes = vacancyDetails.candidates.map(
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

      await this.vacanciesRepo.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }
}
