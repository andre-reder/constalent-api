import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from 'src/shared/database/repositories/users.repository';
import { VacanciesRepository } from 'src/shared/database/repositories/vacancies.repository';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';

@Injectable()
export class VacanciesService {
  constructor(
    private readonly vacanciesRepo: VacanciesRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  findAll() {
    return `This action returns all vacancies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vacancy`;
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

  update(id: number, updateVacancyDto: UpdateVacancyDto) {
    return `This action updates a #${id} vacancy`;
  }

  remove(id: number) {
    return `This action removes a #${id} vacancy`;
  }
}
