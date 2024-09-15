import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';
import { ForbiddenRoles, Roles } from 'src/shared/decorators/ForbiddenRoles';
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

  @Get('/resumed/:id')
  findAllResumed(@ActiveUserId() userId: string, @Param('id') id: string) {
    return this.candidatesService.findAllResumedByVacancy(userId, id);
  }

  @Get(':id')
  findOne(@ActiveUserId() userId: string, @Param('id') id: string) {
    return this.candidatesService.findOne(userId, id);
  }

  @Post()
  @ForbiddenRoles(Roles.customer)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'resume', maxCount: 1 },
      { name: 'psycologicalTest', maxCount: 1 },
      { name: 'candidatesForm', maxCount: 1 },
    ]),
  )
  create(
    @Body() createCandidateDto: CreateCandidateDto,
    @UploadedFiles()
    files: {
      resume: Express.Multer.File[];
      psycologicalTest: Express.Multer.File[];
      candidatesForm: Express.Multer.File[];
    },
  ) {
    return this.candidatesService.create(createCandidateDto, files);
  }

  @Put(':id')
  @ForbiddenRoles(Roles.customer)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'resume', maxCount: 1 },
      { name: 'psycologicalTest', maxCount: 1 },
      { name: 'candidatesForm', maxCount: 1 },
    ]),
  )
  update(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
    @UploadedFiles()
    files: {
      resume: Express.Multer.File[];
      psycologicalTest: Express.Multer.File[];
      candidatesForm: Express.Multer.File[];
    },
  ) {
    return this.candidatesService.update(id, updateCandidateDto, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.candidatesService.remove(id);
  }
}
