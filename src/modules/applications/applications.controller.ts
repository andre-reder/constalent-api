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
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}
  @Get()
  findAll(@ActiveUserId() userId: string) {
    return this.applicationsService.findAll(userId);
  }

  @Get('/interviews/:id')
  findInterviews(@ActiveUserId() userId: string, @Param('id') id: string) {
    return this.applicationsService.findInterviews(userId, id);
  }

  @Get('/candidatesDocs/:id')
  findCandidatesDocs(@Param('id') id: string) {
    return this.applicationsService.findCandidatesDocs(id);
  }

  @Get(':id')
  findOne(@ActiveUserId() userId: string, @Param('id') id: string) {
    return this.applicationsService.findOne(userId, id);
  }

  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(id, updateApplicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(id);
  }
}
