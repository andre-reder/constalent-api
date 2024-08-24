import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

enum Role {
  admin = 'admin',
  customer = 'customer',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6)
  password: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  companyId?: string;

  @IsString()
  @IsEnum(Role)
  role: Role;
}
