import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AuthGuard } from './modules/auth/auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { UsersModule } from './modules/users/users.module';
import { VacanciesModule } from './modules/vacancies/vacancies.module';
import { DatabaseModule } from './shared/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    CompaniesModule,
    UsersModule,
    VacanciesModule,
    CandidatesModule,
    ApplicationsModule,
    InterviewsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
