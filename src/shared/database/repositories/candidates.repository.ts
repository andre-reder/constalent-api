import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CandidatesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findMany<T extends Prisma.candidatesFindManyArgs>(
    findManyDto: Prisma.SelectSubset<T, Prisma.candidatesFindManyArgs>,
  ) {
    return this.prismaService.candidates.findMany(findManyDto);
  }

  findUnique<T extends Prisma.candidatesFindUniqueArgs>(
    findUniqueDto: Prisma.SelectSubset<T, Prisma.candidatesFindUniqueArgs>,
  ) {
    return this.prismaService.candidates.findUnique(findUniqueDto);
  }

  create(createDto: Prisma.candidatesCreateArgs) {
    return this.prismaService.candidates.create(createDto);
  }

  update<T extends Prisma.candidatesUpdateArgs>(
    updateDto: Prisma.SelectSubset<T, Prisma.candidatesUpdateArgs>,
  ) {
    return this.prismaService.candidates.update(updateDto);
  }

  updateMany<T extends Prisma.candidatesUpdateManyArgs>(
    updateManyDto: Prisma.SelectSubset<T, Prisma.candidatesUpdateManyArgs>,
  ) {
    return this.prismaService.candidates.updateMany(updateManyDto);
  }

  delete(deleteDto: Prisma.candidatesDeleteArgs) {
    return this.prismaService.candidates.delete(deleteDto);
  }
}
