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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@ActiveUserId() userId: string) {
    return this.usersService.findAll(userId);
  }

  @Get(':id')
  findOne(@ActiveUserId() userId: string, @Param('id') id: string) {
    return this.usersService.findOne(userId, id);
  }

  @Post()
  create(@ActiveUserId() userId: string, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(userId, createUserDto);
  }

  @Patch(':id')
  update(
    @ActiveUserId() userId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, id, updateUserDto);
  }

  @Delete(':id')
  remove(@ActiveUserId() userId: string, @Param('id') id: string) {
    return this.usersService.remove(userId, id);
  }
}
