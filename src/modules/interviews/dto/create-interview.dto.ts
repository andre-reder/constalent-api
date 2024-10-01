import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

enum InterviewType {
  recruiter = 'recruiter',
  company = 'company',
}

export enum InterviewStatus {
  scheduled = 'scheduled',
  canceled = 'canceled',
  approved = 'approved',
  rejected = 'rejected',
}

export class CreateInterviewDto {
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  date: Date;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  aiSummary?: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(InterviewType)
  type: InterviewType;

  @IsString()
  @IsNotEmpty()
  @IsEnum(InterviewStatus)
  status: InterviewStatus;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  candidateId: string;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  vacancyId: string;

  @IsOptional()
  @IsNumber()
  finalSalary?: number;

  @IsBoolean()
  @Transform(({ value }) => JSON.parse(value))
  hired: boolean;
}
