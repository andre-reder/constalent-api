import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';
import { ForbiddenRoles, Roles } from 'src/shared/decorators/ForbiddenRoles';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { VacanciesService } from './vacancies.service';

@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) {}

  @Get()
  findAll(@ActiveUserId() userId: string) {
    return this.vacanciesService.findAll(userId);
  }

  @Get('resumed')
  findAllResumed(@ActiveUserId() userId: string) {
    return this.vacanciesService.findAllResumed(userId);
  }

  @Get(':id')
  findOne(@ActiveUserId() userId: string, @Param('id') id: string) {
    return this.vacanciesService.findOne(userId, id);
  }

  @Post()
  create(
    @ActiveUserId() userId: string,
    @Body() createVacancyDto: CreateVacancyDto,
  ) {
    return this.vacanciesService.create(userId, createVacancyDto);
  }

  @Put(':id')
  update(
    @ActiveUserId() userId: string,
    @Param('id') id: string,
    @Body() updateVacancyDto: UpdateVacancyDto,
  ) {
    return this.vacanciesService.update(userId, id, updateVacancyDto);
  }

  @ForbiddenRoles(Roles.customer)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vacanciesService.remove(id);
  }
}
