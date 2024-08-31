import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
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
  @IsString()
  @IsMongoId()
  applicationId: string;
}
