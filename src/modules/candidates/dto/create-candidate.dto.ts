import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

enum CandidateStatus {
  stored = 'stored',
  applied = 'applied',
  hired = 'hired',
}

enum Gender {
  male = 'male',
  female = 'female',
}

enum EducationLevel {
  fundamental = 'fundamental',
  medium = 'medium',
  superior = 'superior',
  postGraduation = 'postGraduation',
  master = 'master',
  doctorate = 'doctorate',
}

enum MaritalStatus {
  single = 'single',
  married = 'married',
  divorced = 'divorced',
  widowed = 'widowed',
}

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('BR')
  phone: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  salaryExpected: number;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  birthDate: Date;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  @IsEnum(EducationLevel)
  educationLevel: EducationLevel;

  @IsString()
  @IsOptional()
  graduationCourse?: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  @IsNotEmpty()
  rg: string;

  @IsString()
  @IsOptional()
  cep?: string;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  streetNumber?: number;

  @IsString()
  @IsOptional()
  streetName?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  uf?: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  childrenAmount: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  lastSalary?: number;

  @IsString()
  @IsOptional()
  lastCompany?: string;

  @IsString()
  @IsOptional()
  lastPosition?: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(CandidateStatus)
  status: CandidateStatus;
}
