import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InterviewsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findMany<T extends Prisma.interviewsFindManyArgs>(
    findManyDto: Prisma.SelectSubset<T, Prisma.interviewsFindManyArgs>,
  ) {
    return this.prismaService.interviews.findMany(findManyDto);
  }

  findUnique<T extends Prisma.interviewsFindUniqueArgs>(
    findUniqueDto: Prisma.SelectSubset<T, Prisma.interviewsFindUniqueArgs>,
  ) {
    return this.prismaService.interviews.findUnique(findUniqueDto);
  }

  create(createDto: Prisma.interviewsCreateArgs) {
    return this.prismaService.interviews.create(createDto);
  }

  update<T extends Prisma.interviewsUpdateArgs>(
    updateDto: Prisma.SelectSubset<T, Prisma.interviewsUpdateArgs>,
  ) {
    return this.prismaService.interviews.update(updateDto);
  }

  updateMany<T extends Prisma.interviewsUpdateManyArgs>(
    updateManyDto: Prisma.SelectSubset<T, Prisma.interviewsUpdateManyArgs>,
  ) {
    return this.prismaService.interviews.updateMany(updateManyDto);
  }

  delete(deleteDto: Prisma.interviewsDeleteArgs) {
    return this.prismaService.interviews.delete(deleteDto);
  }

  deleteMany(deleteManyDto: Prisma.interviewsDeleteManyArgs) {
    return this.prismaService.interviews.deleteMany(deleteManyDto);
  }
}
