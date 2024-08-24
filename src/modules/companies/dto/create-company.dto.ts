import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsPhoneNumber('BR')
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsString()
  @IsNotEmpty()
  contactRole: string;

  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  userLoginEmail?: string;

  @IsOptional()
  @IsString()
  userFirstPassword?: string;
}
