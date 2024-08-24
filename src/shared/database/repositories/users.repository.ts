import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findMany<T extends Prisma.usersFindManyArgs>(
    findManyDto: Prisma.SelectSubset<T, Prisma.usersFindManyArgs>,
  ) {
    return this.prismaService.users.findMany(findManyDto);
  }

  findUnique<T extends Prisma.usersFindUniqueArgs>(
    findUniqueDto: Prisma.SelectSubset<T, Prisma.usersFindUniqueArgs>,
  ) {
    return this.prismaService.users.findUnique(findUniqueDto);
  }

  create(createDto: Prisma.usersCreateArgs) {
    return this.prismaService.users.create(createDto);
  }

  update<T extends Prisma.usersUpdateArgs>(
    updateDto: Prisma.SelectSubset<T, Prisma.usersUpdateArgs>,
  ) {
    return this.prismaService.users.update(updateDto);
  }

  delete(deleteDto: Prisma.usersDeleteArgs) {
    return this.prismaService.users.delete(deleteDto);
  }
}
