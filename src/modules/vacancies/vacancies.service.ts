import { BadRequestException, Injectable } from '@nestjs/common';
import { ApplicationsRepository } from 'src/shared/database/repositories/applications.repository';
import { CandidatesRepository } from 'src/shared/database/repositories/candidates.repository';
import { InterviewsRepository } from 'src/shared/database/repositories/interviews.repository';
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
    private readonly applicationsRepo: ApplicationsRepository,
    private readonly interviewsRepo: InterviewsRepository,
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
        include: { company: { select: { name: true, id: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return { success: true, vacancies };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async findAllResumed(userId: string) {
    try {
      const userDetails = await this.usersRepo.findUnique({
        where: { id: userId },
      });

      const vacancies = await this.vacanciesRepo.findMany({
        where: {
          status: 'open',
          ...(userDetails.role === 'customer'
            ? { companyId: userDetails.companyId }
            : {}),
        },
        select: { id: true, title: true, companyId: true },
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
        throw new BadRequestException(
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
        throw new BadRequestException(
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

      return { success: true };
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
        throw new BadRequestException(
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
        throw new BadRequestException('You are not allowed to open a vacancy');
      }

      const isReopeningVacancy = isChangingStatus && newStatus === 'waiting';
      const isOpeningVacancy = isChangingStatus && newStatus === 'open';
      const isCancellingVacancy = isChangingStatus && newStatus === 'canceled';
      const isFinishingVacancy = isChangingStatus && newStatus === 'finished';

      const hiredCandidates = await this.applicationsRepo.findMany({
        where: { vacancyId: id, status: 'approvedByCompany' },
      });

      const canFinishVacancy =
        hiredCandidates.length >= vacancy.vacanciesAmount;

      if (isFinishingVacancy && !canFinishVacancy) {
        throw new BadRequestException(
          'You cannot finish a vacancy without hiring the necessary amount of candidates',
        );
      }

      const canCancelVacancy = hiredCandidates.length === 0;

      if (isCancellingVacancy && !canCancelVacancy) {
        throw new BadRequestException(
          'You cannot cancel a vacancy with hired candidates',
        );
      }

      const { alignmentMeetingDate } = updateVacancyDto;
      const canOpenVacancy =
        vacancy.alignmentMeetingDate || alignmentMeetingDate;

      if (isOpeningVacancy && !canOpenVacancy) {
        throw new BadRequestException(
          'You cannot open a vacancy before the alignment meeting date',
        );
      }

      const canReopenVacancy = currentStatus === 'canceled';

      if (isReopeningVacancy && !canReopenVacancy) {
        throw new BadRequestException(
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

      if (isFinishingVacancy) {
        const restoreCandidates = async () => {
          await this.candidatesRepo.updateMany({
            where: {
              applications: {
                some: {
                  vacancyId: id,
                  status: { in: ['rejectedByCompany', 'rejectedByRecruiter'] },
                },
              },
            },
            data: { status: 'stored' },
          });
        };

        const changeApplicationsThatWereWaitingStatus = async () => {
          await this.applicationsRepo.updateMany({
            where: {
              vacancyId: id,
              status: { in: ['approvedByRecruiter', 'waiting'] },
            },
            data: { status: 'notContinued' },
          });
        };

        const cancelAllPendingInterviews = async () => {
          await this.interviewsRepo.updateMany({
            where: { vacancyId: id, status: 'scheduled' },
            data: { status: 'canceled' },
          });
        };

        await Promise.all([
          restoreCandidates(),
          changeApplicationsThatWereWaitingStatus(),
          cancelAllPendingInterviews(),
        ]);
      }

      if (isCancellingVacancy) {
        const restoreCandidates = async () => {
          await this.candidatesRepo.updateMany({
            where: {
              applications: {
                some: {
                  vacancyId: id,
                },
              },
            },
            data: { status: 'stored' },
          });
        };

        const changeApplicationsThatWereWaitingStatus = async () => {
          await this.applicationsRepo.updateMany({
            where: {
              vacancyId: id,
            },
            data: { status: 'notContinued' },
          });
        };

        const cancelAllPendingInterviews = async () => {
          await this.interviewsRepo.updateMany({
            where: { vacancyId: id, status: 'scheduled' },
            data: { status: 'canceled' },
          });
        };

        await Promise.all([
          restoreCandidates(),
          changeApplicationsThatWereWaitingStatus(),
          cancelAllPendingInterviews(),
        ]);
      }

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const vacancy = await this.vacanciesRepo.findUnique({
        where: { id },
      });

      const removeVacancy = async () =>
        await this.vacanciesRepo.delete({ where: { id } });

      const removeApplications = async () => {
        await this.applicationsRepo.deleteMany({
          where: { vacancyId: vacancy.id },
        });
      };

      const removeInterviews = async () => {
        await this.interviewsRepo.deleteMany({
          where: { vacancyId: vacancy.id },
        });
      };

      const storeCandidates = async () => {
        await this.candidatesRepo.updateMany({
          where: {
            applications: {
              some: {
                vacancyId: vacancy.id,
                status: { in: ['approvedByRecruiter', 'waiting'] },
              },
            },
          },
          data: { status: 'stored' },
        });
      };

      await Promise.all([
        removeVacancy(),
        removeApplications(),
        removeInterviews(),
        storeCandidates(),
      ]);

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }
}
