import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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
  technical = 'technical',
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
  @IsOptional()
  @Transform(({ value }) => Number(value) || undefined)
  salaryExpected?: number;

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
  complement?: string;

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
  @IsOptional()
  resume?: string;

  @IsString()
  @IsOptional()
  psycologicalTest?: string;

  @IsString()
  @IsOptional()
  candidatesForm?: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(CandidateStatus)
  status: CandidateStatus;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  isRegularWithGovernmentTax: boolean;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  hasCriminalRecord: boolean;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  sentenceServed: boolean;

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Se for um array vazio como string, retorna um array vazio
      if (value === '[]') return [];

      try {
        return JSON.parse(value); // Tenta fazer o parse apenas se for uma string JSON válida
      } catch (e) {
        throw new BadRequestException('Invalid JSON format for courtCases');
      }
    }
    return value; // Caso o valor já esteja no formato esperado (array), retorna diretamente
  })
  courtCases: string[];

  @IsString()
  @IsOptional()
  portfolio?: string;
}
