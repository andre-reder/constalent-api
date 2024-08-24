import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
} from '@nestjs/common';
import { isEmail } from 'class-validator';
import { IsPublic } from 'src/shared/decorators/IsPublic';
import { AuthService } from './auth.service';
import { RegisterFirebaseDto } from './dto/register-firebase.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SigninDto } from './dto/signin.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @IsPublic()
  @HttpCode(200)
  authenticate(@Body() authenticateDto: SigninDto) {
    return this.authService.signin(authenticateDto);
  }

  @Post('reset-password')
  @IsPublic()
  @HttpCode(200)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('update-password')
  @HttpCode(200)
  updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.updatePassword(updatePasswordDto);
  }

  @Get('verify-email')
  @IsPublic()
  verifyIfEmailIsInUse(@Query('email') email: string) {
    if (!isEmail(email)) {
      throw new BadRequestException('E-mail must be a valid e-mail');
    }

    return this.authService.verifyIfEmailIsInUse(email);
  }

  @Post('register-firebase')
  @IsPublic()
  @HttpCode(200)
  registerUserAtFirebase(@Body() registerFirebaseDto: RegisterFirebaseDto) {
    return this.authService.registerUserAtFirebase(registerFirebaseDto);
  }
}
