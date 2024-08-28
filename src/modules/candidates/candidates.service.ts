import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CandidatesRepository } from 'src/shared/database/repositories/candidates.repository';
import { UsersRepository } from 'src/shared/database/repositories/users.repository';
import { VacanciesRepository } from 'src/shared/database/repositories/vacancies.repository';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(
    private readonly candidateRepository: CandidatesRepository,
    private readonly vacanciesRepository: VacanciesRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async findAll(userId: string) {
    try {
      const userDetails = await this.usersRepo.findUnique({
        where: { id: userId },
      });

      const allCandidates = await this.candidateRepository.findMany({
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
        await this.candidateRepository.findUnique({
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

      const candidates = await this.candidateRepository.findMany({
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

  async create(userId: string, createCandidateDto: CreateCandidateDto) {
    try {
    } catch (error) {
      error.success = false;
      throw error;
    }
  }

  update(id: string, updateCandidateDto: UpdateCandidateDto) {
    return `This action updates a #${id} candidate`;
  }

  remove(id: string) {
    return `This action removes a #${id} candidate`;
  }
}
