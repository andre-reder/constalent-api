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
  salaryExpected: number;

  @IsNotEmpty()
  @IsDate()
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
  gradutationCourse?: string;

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
  streetNumber?: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus;

  @IsInt()
  @IsNotEmpty()
  childrenAmount: number;

  @IsNumber()
  @IsOptional()
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
