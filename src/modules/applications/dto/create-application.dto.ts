import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum ApplicationStatus {
  waiting = 'waiting',
  rejectedByRecruiter = 'rejectedByRecruiter',
  approvedByRecruiter = 'approvedByRecruiter',
  standby = 'standby',
  rejectedByCompany = 'rejectedByCompany',
  approvedByCompany = 'approvedByCompany',
  notContinued = 'notContinued',
}

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

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
  positivePoints?: string;

  @IsOptional()
  @IsString()
  negativePoints?: string;

  @IsOptional()
  @IsNumber()
  finalSalary?: number;
}
