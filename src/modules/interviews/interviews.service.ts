/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConflictException, Injectable } from '@nestjs/common';
import { ApplicationsRepository } from 'src/shared/database/repositories/applications.repository';
import { CandidatesRepository } from 'src/shared/database/repositories/candidates.repository';
import { CompaniesRepository } from 'src/shared/database/repositories/companies.repository';
import { InterviewsRepository } from 'src/shared/database/repositories/interviews.repository';
import { UsersRepository } from 'src/shared/database/repositories/users.repository';
import { VacanciesRepository } from 'src/shared/database/repositories/vacancies.repository';
import {
  CreateInterviewDto,
  InterviewStatus,
} from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

enum ApplicationStatus {
  waiting = 'waiting',
  rejectedByRecruiter = 'rejectedByRecruiter',
  approvedByRecruiter = 'approvedByRecruiter',
  standby = 'standby',
  rejectedByCompany = 'rejectedByCompany',
  approvedByCompany = 'approvedByCompany',
}

@Injectable()
export class InterviewsService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly interviewsRepo: InterviewsRepository,
    private readonly applicationsRepo: ApplicationsRepository,
    private readonly vacanciesRepo: VacanciesRepository,
    private readonly candidatesRepo: CandidatesRepository,
    private readonly companiesRepo: CompaniesRepository,
  ) {}

  private async handleApplicationStatusActions(
    status: ApplicationStatus,
    applicationId: string,
    interviewId: string,
    hired: boolean,
  ) {
    const application = await this.applicationsRepo.findUnique({
      where: { id: applicationId },
      include: {
        interviews: { select: { id: true, type: true } },
      },
    });

    const companyInterviews = application.interviews.filter(
      (interview) => interview.type === 'company',
    );

    const applyCandidate = async () =>
      await this.candidatesRepo.update({
        where: { id: application.candidateId },
        data: { status: 'applied' },
      });

    if (status === 'waiting') {
      await applyCandidate();
      return;
    }

    const recruiterInterview = application.interviews.find(
      (interview) => interview.type === 'recruiter',
    );

    if (status && status.includes('rejected')) {
      const storeCandidate = async () =>
        await this.candidatesRepo.update({
          where: { id: application.candidateId },
          data: { status: 'stored' },
        });

      if (status.includes('recruiter')) {
        const doesRecuiterInterviewExist =
          !!application.interviews &&
          application.interviews.length > 0 &&
          application.interviews.some(
            (interview) => interview.type === 'recruiter',
          );

        if (!doesRecuiterInterviewExist) {
          throw new ConflictException(
            'This application does not have recruiter interview, so it cannot be rejected by recruiter',
          );
        }

        await this.applicationsRepo.update({
          where: { id: applicationId },
          data: { status },
        });

        const rejectRecruiterInterview = async () =>
          await this.interviewsRepo.update({
            where: { id: recruiterInterview.id },
            data: { status: 'rejected' },
          });

        await Promise.all([rejectRecruiterInterview(), storeCandidate()]);
      } else {
        const doesCompanyInterviewExist =
          !!application.interviews &&
          application.interviews.length > 0 &&
          application.interviews.some(
            (interview) => interview.type === 'company',
          );

        if (!doesCompanyInterviewExist) {
          throw new ConflictException(
            'This application does not have company interview, so it cannot be rejected by company',
          );
        }

        await this.applicationsRepo.update({
          where: { id: applicationId },
          data: { status },
        });

        const rejectCompanyInterview = async () =>
          await this.interviewsRepo.update({
            where: { id: interviewId },
            data: { status: 'rejected' },
          });

        await Promise.all([rejectCompanyInterview(), storeCandidate()]);
      }
    }

    if (status && status.includes('approved')) {
      await this.interviewsRepo.update({
        where: { id: recruiterInterview.id },
        data: { status: 'approved' },
      });

      if (status === 'approvedByCompany') {
        const doesCompanyInterviewExist =
          !!application.interviews &&
          application.interviews.length > 0 &&
          application.interviews.some(
            (interview) => interview.type === 'company',
          );

        if (!doesCompanyInterviewExist) {
          throw new ConflictException(
            'This application does not have company interview, so it cannot be rejected by company',
          );
        }

        if (hired) {
          const hireCandidate = async () =>
            await this.candidatesRepo.update({
              where: { id: application.candidateId },
              data: { status: 'hired' },
            });

          const approveCompanyInterviews = async () =>
            await this.interviewsRepo.updateMany({
              where: { id: { in: companyInterviews.map((x) => x.id) } },
              data: { status: 'approved' },
            });

          await this.applicationsRepo.update({
            where: { id: applicationId },
            data: { status },
          });

          await Promise.all([hireCandidate(), approveCompanyInterviews()]);

          const getCurrentHiredApplicationsForVacancy = async () =>
            await this.applicationsRepo.findMany({
              where: {
                status: 'approvedByCompany',
                vacancyId: application.vacancyId,
              },
            });

          const getVacancyDetails = async () =>
            await this.vacanciesRepo.findUnique({
              where: { id: application.vacancyId },
            });

          const [hiredApplications, vacancyDetails] = await Promise.all([
            getCurrentHiredApplicationsForVacancy(),
            getVacancyDetails(),
          ]);

          if (vacancyDetails.vacanciesAmount <= hiredApplications.length) {
            await this.vacanciesRepo.update({
              where: { id: application.vacancyId },
              data: { status: 'finished' },
            });

            const hiredCandidates = [
              ...hiredApplications.map((x) => x.candidateId),
              application.candidateId,
            ];

            const allCandidatesAppliedForVacancy =
              await this.candidatesRepo.findMany({
                where: { applications: { some: { id: application.id } } },
                include: {
                  applications: {
                    select: { status: true, id: true },
                  },
                },
              });

            const candidatesToStore: string[] = [];

            allCandidatesAppliedForVacancy.forEach((candidate) => {
              const isCandidateHired = hiredCandidates.includes(candidate.id);

              if (isCandidateHired) return;

              const notInHiringStatus = [
                'notContinued',
                'rejectedByCompany',
                'rejectedByRecruiter',
              ];

              const isCandidateInHiringProcess = candidate.applications.some(
                (apl) =>
                  !notInHiringStatus.includes(apl.status) &&
                  apl.id !== application.id,
              );

              if (isCandidateInHiringProcess) return;

              candidatesToStore.push(candidate.id);
            });

            await this.candidatesRepo.updateMany({
              where: {
                id: {
                  in: candidatesToStore,
                },
                applications: {
                  some: { id: applicationId },
                },
              },
              data: { status: 'stored' },
            });

            await this.applicationsRepo.updateMany({
              where: {
                vacancyId: application.vacancyId,
                candidateId: { not: application.candidateId },
                status: { not: 'approvedByCompany' },
              },
              data: { status: 'notContinued' },
            });
          }
        } else {
          await this.interviewsRepo.update({
            where: { id: interviewId },
            data: { status: 'approved' },
          });
        }
      } else if (status === 'approvedByRecruiter') {
        const doesRecuiterInterviewExist =
          !!application.interviews &&
          application.interviews.length > 0 &&
          application.interviews.some(
            (interview) => interview.type === 'recruiter',
          );

        if (!doesRecuiterInterviewExist) {
          throw new ConflictException(
            'This application does not have recruiter interview, so it cannot be approved by recruiter',
          );
        }

        await this.applicationsRepo.update({
          where: { id: applicationId },
          data: { status },
        });

        await this.interviewsRepo.update({
          where: { id: recruiterInterview.id },
          data: { status: 'approved' },
        });

        await applyCandidate();
      }
    }

    if (status && status === 'standby') {
      await this.interviewsRepo.update({
        where: { id: recruiterInterview.id },
        data: { status: 'standby' },
      });

      await this.applicationsRepo.update({
        where: { id: applicationId },
        data: { status },
      });
    }
  }

  async findAll(userId: string) {
    try {
      const userDetails = await this.usersRepo.findUnique({
        where: { id: userId },
      });

      const isCustomer = userDetails.role === 'customer';
      const { companyId } = userDetails;

      const interviews = await this.interviewsRepo.findMany({
        where: {
          ...(isCustomer ? { companyId } : {}),
        },
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
            },
          },
          vacancy: {
            select: {
              id: true,
              title: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return { success: true, interviews };
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

      const isCustomer = userDetails.role === 'customer';
      const { companyId } = userDetails;

      const interview = await this.interviewsRepo.findUnique({
        where: {
          id,
          ...(isCustomer ? { companyId } : {}),
        },
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
            },
          },
          vacancy: {
            select: {
              id: true,
              title: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { success: true, interview };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async create(createInterviewDto: CreateInterviewDto) {
    try {
      const {
        candidateId,
        vacancyId,
        status,
        type,
        finalSalary,
        hired,
        ...rest
      } = createInterviewDto;

      const vacancyDetails = await this.vacanciesRepo.findUnique({
        where: { id: vacancyId },
      });

      const interviewStatsToApplicationStatusMap = {
        scheduled: 'waiting',
        canceled: 'waiting',
        approved:
          type === 'company' ? 'approvedByCompany' : 'approvedByRecruiter',
        rejected:
          type === 'company' ? 'rejectedByCompany' : 'rejectedByRecruiter',
      } as Record<InterviewStatus, ApplicationStatus>;

      const application = await this.applicationsRepo.findUnique({
        where: { candidateId_vacancyId: { candidateId, vacancyId } },
      });

      const interview = await this.interviewsRepo.create({
        data: {
          ...rest,
          status,
          type,
          createdAt: new Date(),
          vacancy: {
            connect: { id: vacancyId },
          },
          candidate: {
            connect: { id: candidateId },
          },
          application: {
            ...(application && application.id
              ? { connect: { id: application.id } }
              : {
                  create: {
                    date: new Date(),
                    status: interviewStatsToApplicationStatusMap[status],
                    candidateId,
                    vacancyId,
                    companyId: vacancyDetails.companyId,
                  },
                }),
          },
          company: {
            connect: { id: vacancyDetails.companyId },
          },
        },
      });

      const applicationStatus = interviewStatsToApplicationStatusMap[status];
      console.log('applicationStatus', applicationStatus);

      await this.handleApplicationStatusActions(
        applicationStatus,
        interview.applicationId,
        interview.id,
        hired,
      );

      if (finalSalary) {
        const company = await this.companiesRepo.findUnique({
          where: { id: application.companyId },
        });

        const { comissionPercentage, minComission, maxComission } = company;
        const percentageOfSalary = finalSalary * (comissionPercentage / 100);
        const comission =
          percentageOfSalary < minComission
            ? minComission
            : percentageOfSalary > maxComission
            ? maxComission
            : percentageOfSalary;

        await this.applicationsRepo.update({
          where: { id: interview.applicationId },
          data: { recruiterComission: comission, finalSalary },
        });
      }

      return { success: true, interview };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async update(id: string, updateInterviewDto: UpdateInterviewDto) {
    try {
      const interview = await this.interviewsRepo.findUnique({
        where: { id },
      });

      const { status: currentStatus } = interview;
      const {
        status,
        type,
        hired,
        vacancyId,
        candidateId,
        finalSalary,
        ...rest
      } = updateInterviewDto;

      const interviewStatusToApplicationStatusMap = {
        scheduled: 'waiting',
        canceled: 'waiting',
        approved:
          type === 'company' ? 'approvedByCompany' : 'approvedByRecruiter',
        rejected:
          type === 'company' ? 'rejectedByCompany' : 'rejectedByRecruiter',
      } as Record<InterviewStatus, ApplicationStatus>;

      await this.interviewsRepo.update({
        where: { id },
        data: {
          ...rest,
          status,
          type,
        },
      });

      const isChangingStatus = currentStatus !== status;

      if (isChangingStatus) {
        await this.handleApplicationStatusActions(
          interviewStatusToApplicationStatusMap[status],
          interview.applicationId,
          id,
          hired,
        );
      }

      if (finalSalary) {
        await this.applicationsRepo.update({
          where: { id: interview.applicationId },
          data: { finalSalary },
        });
      }

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const interview = await this.interviewsRepo.findUnique({
        where: { id },
      });

      if (interview.status === 'approved' || interview.status === 'rejected') {
        throw new ConflictException(
          'Approved or rejected interviews cannot be deleted',
        );
      }

      const removeApplication = async () => {
        await this.applicationsRepo.delete({
          where: { id: interview.applicationId },
        });
      };

      const storeCandidate = async () => {
        await this.candidatesRepo.update({
          where: { id: interview.candidateId },
          data: { status: 'stored' },
        });
      };

      const removeInterview = async () => {
        await this.interviewsRepo.delete({ where: { id } });
      };

      await Promise.all([
        removeApplication(),
        storeCandidate(),
        removeInterview(),
      ]);

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }
}
