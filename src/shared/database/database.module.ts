import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
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
  ],
  exports: [
    UsersRepository,
    CompaniesRepository,
    VacanciesRepository,
    CandidatesRepository,
  ],
})
export class DatabaseModule {}
