import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CompaniesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findMany<T extends Prisma.companiesFindManyArgs>(
    findManyDto: Prisma.SelectSubset<T, Prisma.companiesFindManyArgs>,
  ) {
    return this.prismaService.companies.findMany(findManyDto);
  }

  findUnique<T extends Prisma.companiesFindUniqueArgs>(
    findUniqueDto: Prisma.SelectSubset<T, Prisma.companiesFindUniqueArgs>,
  ) {
    return this.prismaService.companies.findUnique(findUniqueDto);
  }

  create(createDto: Prisma.companiesCreateArgs) {
    return this.prismaService.companies.create(createDto);
  }

  update<T extends Prisma.companiesUpdateArgs>(
    updateDto: Prisma.SelectSubset<T, Prisma.companiesUpdateArgs>,
  ) {
    return this.prismaService.companies.update(updateDto);
  }

  delete(deleteDto: Prisma.companiesDeleteArgs) {
    return this.prismaService.companies.delete(deleteDto);
  }
}
