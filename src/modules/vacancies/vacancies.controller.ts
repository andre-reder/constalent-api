import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { VacanciesService } from './vacancies.service';

@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) {}

  @Post()
  create(
    @ActiveUserId() userId: string,
    @Body() createVacancyDto: CreateVacancyDto,
  ) {
    return this.vacanciesService.create(userId, createVacancyDto);
  }

  @Get()
  findAll() {
    return this.vacanciesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vacanciesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVacancyDto: UpdateVacancyDto) {
    return this.vacanciesService.update(+id, updateVacancyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vacanciesService.remove(+id);
  }
}
