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
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}
  @Get()
  findAll(@ActiveUserId() userId: string) {
    return this.candidatesService.findAll(userId);
  }

  @Get('/vacancy/:id')
  findAllByVacancy(@ActiveUserId() userId: string, @Param('id') id: string) {
    return this.candidatesService.findAllByVacancy(userId, id);
  }

  @Get(':id')
  findOne(@ActiveUserId() userId: string, @Param('id') id: string) {
    return this.candidatesService.findOne(userId, id);
  }

  @Post()
  create(
    @ActiveUserId() userId: string,
    @Body() createCandidateDto: CreateCandidateDto,
  ) {
    return this.candidatesService.create(userId, createCandidateDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.candidatesService.update(id, updateCandidateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.candidatesService.remove(id);
  }
}
