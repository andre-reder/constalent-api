import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class VacanciesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findMany<T extends Prisma.vacanciesFindManyArgs>(
    findManyDto: Prisma.SelectSubset<T, Prisma.vacanciesFindManyArgs>,
  ) {
    return this.prismaService.vacancies.findMany(findManyDto);
  }

  findUnique<T extends Prisma.vacanciesFindUniqueArgs>(
    findUniqueDto: Prisma.SelectSubset<T, Prisma.vacanciesFindUniqueArgs>,
  ) {
    return this.prismaService.vacancies.findUnique(findUniqueDto);
  }

  create(createDto: Prisma.vacanciesCreateArgs) {
    return this.prismaService.vacancies.create(createDto);
  }

  update<T extends Prisma.vacanciesUpdateArgs>(
    updateDto: Prisma.SelectSubset<T, Prisma.vacanciesUpdateArgs>,
  ) {
    return this.prismaService.vacancies.update(updateDto);
  }

  delete(deleteDto: Prisma.vacanciesDeleteArgs) {
    return this.prismaService.vacancies.delete(deleteDto);
  }
}
