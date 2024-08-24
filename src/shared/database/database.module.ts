import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
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
  ],
  exports: [UsersRepository, CompaniesRepository, VacanciesRepository],
})
export class DatabaseModule {}
