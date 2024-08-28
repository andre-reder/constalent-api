import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ApplicationsRepository } from './repositories/applications.repository';
import { CandidatesRepository } from './repositories/candidates.repository';
import { CompaniesRepository } from './repositories/companies.repository';
import { UsersRepository } from './repositories/users.repository';
import { VacanciesRepository } from './repositories/vacancies.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    UsersRepository,
    CompaniesRepository,
    VacanciesRepository,
    CandidatesRepository,
    ApplicationsRepository,
  ],
  exports: [
    UsersRepository,
    CompaniesRepository,
    VacanciesRepository,
    CandidatesRepository,
    ApplicationsRepository,
  ],
})
export class DatabaseModule {}
