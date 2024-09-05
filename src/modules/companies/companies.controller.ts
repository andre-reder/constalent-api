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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ForbiddenRoles(Roles.customer)
  findAll() {
    return this.companiesService.findAll();
  }

  @Get('resumed')
  @ForbiddenRoles(Roles.customer)
  findResumedAll() {
    return this.companiesService.findAllResumed();
  }

  @Get(':id')
  findOne(@ActiveUserId() userId: string, @Param('id') id: string) {
    return this.companiesService.findOne(userId, id);
  }

  @Post()
  @ForbiddenRoles(Roles.customer)
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Put(':id')
  @ForbiddenRoles(Roles.customer)
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  remove(@ActiveUserId() userId: string, @Param('id') id: string) {
    return this.companiesService.remove(userId, id);
  }
}
