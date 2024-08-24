import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
