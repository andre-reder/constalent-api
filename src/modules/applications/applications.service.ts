import { ConflictException, Injectable } from '@nestjs/common';
import { ApplicationsRepository } from 'src/shared/database/repositories/applications.repository';
import { CandidatesRepository } from 'src/shared/database/repositories/candidates.repository';
import { InterviewsRepository } from 'src/shared/database/repositories/interviews.repository';
import { UsersRepository } from 'src/shared/database/repositories/users.repository';
import { VacanciesRepository } from 'src/shared/database/repositories/vacancies.repository';
import {
  ApplicationStatus,
  CreateApplicationDto,
} from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationsRepo: ApplicationsRepository,
    private readonly usersRepo: UsersRepository,
    private readonly vacanciesRepo: VacanciesRepository,
    private readonly candidatesRepo: CandidatesRepository,
    private readonly interviewsRepo: InterviewsRepository,
  ) {}

  private async handleApplicationStatusActions(
    status: ApplicationStatus,
    applicationId: string,
  ) {
    if (status === 'waiting') {
      return;
    }

    const application = await this.applicationsRepo.findUnique({
      where: { id: applicationId },
      include: {
        interviews: { select: { id: true, type: true } },
      },
    });

    const recruiterInterview = application.interviews.find(
      (interview) => interview.type === 'recruiter',
    );

    const companyInterview = application.interviews.find(
      (interview) => interview.type === 'company',
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

        const rejectCompanyInterview = async () =>
          await this.interviewsRepo.update({
            where: { id: companyInterview.id },
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
        const hireCandidate = async () =>
          await this.candidatesRepo.update({
            where: { id: application.candidateId },
            data: { status: 'hired' },
          });

        const approveCompanyInterview = async () =>
          await this.interviewsRepo.update({
            where: { id: companyInterview.id },
            data: { status: 'approved' },
          });

        await Promise.all([hireCandidate(), approveCompanyInterview()]);

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
        }
      }
    }
  }

  async findAll(userId: string) {
    try {
      const userDetails = await this.usersRepo.findUnique({
        where: { id: userId },
      });

      const isCustomer = userDetails.role === 'customer';
      const { companyId } = userDetails;

      const applications = await this.applicationsRepo.findMany({
        where: {
          ...(isCustomer ? { companyId } : {}),
        },
        include: {
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
          candidate: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { success: true, applications };
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

      const application = await this.applicationsRepo.findUnique({
        where: {
          id,
          ...(isCustomer ? { companyId } : {}),
        },
        include: {
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
          candidate: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { success: true, application };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  async create(createApplicationDto: CreateApplicationDto) {
    try {
      const { candidateId, vacancyId, ...rest } = createApplicationDto;

      const getCandidate = async () =>
        await this.candidatesRepo.findUnique({
          where: { id: candidateId },
          include: {
            applications: { select: { status: true } },
          },
        });

      const getVacancy = async () =>
        await this.vacanciesRepo.findUnique({
          where: { id: vacancyId },
          include: { company: { select: { id: true } } },
        });

      const [candidate, vacancy] = await Promise.all([
        getCandidate(),
        getVacancy(),
      ]);

      if (!candidate || !vacancy) {
        return { success: false, message: 'Candidate or vacancy not found' };
      }

      const isCandidateAlreadyApplied =
        !!candidate.applications &&
        candidate.applications.length > 0 &&
        candidate.applications.some((apl) => apl.status.includes('approved'));

      if (isCandidateAlreadyApplied) {
        throw new ConflictException('This candidate is already applied');
      }

      const isVacancyOpen = vacancy.status === 'open';

      if (!isVacancyOpen) {
        throw new ConflictException('This vacancy is not open');
      }

      const createApplication = async () =>
        await this.applicationsRepo.create({
          data: {
            ...rest,
            date: new Date(),
            candidate: { connect: { id: candidateId } },
            vacancy: { connect: { id: vacancyId } },
            company: { connect: { id: vacancy.company.id } },
          },
        });

      const applyCandidate = async () =>
        await this.candidatesRepo.update({
          where: { id: candidateId },
          data: { status: 'applied' },
        });

      const [createdApplication] = await Promise.all([
        createApplication(),
        applyCandidate(),
      ]);

      await this.handleApplicationStatusActions(
        createdApplication.status as ApplicationStatus,
        createdApplication.id,
      );

      return { success: true };
    } catch (error) {
      error.success = false;
    }
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto) {
    try {
      const { status, positivePoints, negativePoints } = updateApplicationDto;

      await this.handleApplicationStatusActions(status, id);

      await this.applicationsRepo.update({
        where: { id },
        data: {
          status,
          positivePoints,
          negativePoints,
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
      await this.applicationsRepo.delete({ where: { id } });

      return { success: true };
    } catch (error) {
      error.success = false;
      throw error;
    }
  }
}
