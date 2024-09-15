import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ApplicationsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findMany<T extends Prisma.applicationsFindManyArgs>(
    findManyDto: Prisma.SelectSubset<T, Prisma.applicationsFindManyArgs>,
  ) {
    return this.prismaService.applications.findMany(findManyDto);
  }

  findUnique<T extends Prisma.applicationsFindUniqueArgs>(
    findUniqueDto: Prisma.SelectSubset<T, Prisma.applicationsFindUniqueArgs>,
  ) {
    return this.prismaService.applications.findUnique(findUniqueDto);
  }

  create(createDto: Prisma.applicationsCreateArgs) {
    return this.prismaService.applications.create(createDto);
  }

  update<T extends Prisma.applicationsUpdateArgs>(
    updateDto: Prisma.SelectSubset<T, Prisma.applicationsUpdateArgs>,
  ) {
    return this.prismaService.applications.update(updateDto);
  }

  updateMany<T extends Prisma.applicationsUpdateManyArgs>(
    updateManyDto: Prisma.SelectSubset<T, Prisma.applicationsUpdateManyArgs>,
  ) {
    return this.prismaService.applications.updateMany(updateManyDto);
  }

  delete(deleteDto: Prisma.applicationsDeleteArgs) {
    return this.prismaService.applications.delete(deleteDto);
  }

  deleteMany(deleteManyDto: Prisma.applicationsDeleteManyArgs) {
    return this.prismaService.applications.deleteMany(deleteManyDto);
  }
}
