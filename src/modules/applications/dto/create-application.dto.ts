import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum ApplicationStatus {
  waiting = 'waiting',
  rejectedByRecruiter = 'rejectedByRecruiter',
  approvedByRecruiter = 'approvedByRecruiter',
  rejectedByCompany = 'rejectedByCompany',
  approvedByCompany = 'approvedByCompany',
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
}
