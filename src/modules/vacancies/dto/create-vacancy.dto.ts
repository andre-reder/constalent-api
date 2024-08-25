import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

enum OperatingModel {
  remote = 'remote',
  hybrid = 'hybrid',
  presential = 'presential',
}

enum ContractType {
  clt = 'clt',
  pj = 'pj',
  internship = 'internship',
  youngApprentice = 'youngApprentice',
}

enum Level {
  youngApprentice = 'youngApprentice',
  internship = 'internship',
  trainee = 'trainee',
  assistant = 'assistant',
  junior = 'junior',
  pleno = 'pleno',
  senior = 'senior',
  coordinator = 'coordinator',
  manager = 'manager',
  director = 'director',
  notApplicable = 'notApplicable',
}

enum Status {
  waiting = 'waiting',
  open = 'open',
  canceled = 'canceled',
  finished = 'finished',
}

enum Gender {
  male = 'male',
  female = 'female',
  indistinct = 'indistinct',
}

enum EducationLevel {
  fundamental = 'fundamental',
  medium = 'medium',
  superior = 'superior',
  postGraduation = 'postGraduation',
  master = 'master',
  doctorate = 'doctorate',
}

export class CreateVacancyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  locationCep: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(OperatingModel)
  operatingModel: OperatingModel;

  @IsString()
  @IsNotEmpty()
  @IsEnum(ContractType)
  contractType: ContractType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;

  @IsString()
  @IsEnum(Level)
  @IsNotEmpty()
  level: Level;

  @IsNumber()
  @IsNotEmpty()
  minSalary: number;

  @IsNumber()
  @IsNotEmpty()
  maxSalary: number;

  @IsNumber()
  @IsNotEmpty()
  recruiterCommission: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsBoolean()
  @IsNotEmpty()
  hasVariableComissions: boolean;

  @IsString()
  @IsNotEmpty()
  responsibleName: string;

  @IsString()
  @IsNotEmpty()
  responsiblePhone: string;

  @IsString()
  @IsNotEmpty()
  responsibleEmail: string;

  @IsString()
  @IsNotEmpty()
  reasonForOpening: string;

  @IsBoolean()
  @IsNotEmpty()
  isSecret: boolean;

  @IsNumber()
  @IsNotEmpty()
  vacanciesAmount: number;

  @IsNumber()
  @IsOptional()
  subordinatesAmount?: number;

  @IsString()
  @IsNotEmpty()
  workingSchedule: string;

  @IsBoolean()
  @IsNotEmpty()
  needsTravel: boolean;

  @IsBoolean()
  @IsNotEmpty()
  needsExtraHours: boolean;

  @IsNumber()
  @IsNotEmpty()
  minAge: number;

  @IsNumber()
  @IsNotEmpty()
  maxAge: number;

  @IsEnum(Gender)
  @IsString()
  @IsNotEmpty()
  gender: Gender;

  @IsEnum(EducationLevel)
  @IsString()
  @IsOptional()
  educationLevel?: EducationLevel;

  @IsArray()
  @IsOptional()
  benefits: string[];

  @IsString()
  @IsOptional()
  otherBenefits?: string;

  @IsNumber()
  @IsOptional()
  minExperience?: number;

  @IsNumber()
  @IsOptional()
  desirableExperience?: number;

  @IsString()
  @IsNotEmpty()
  necessaryRequirements: string;

  @IsOptional()
  @IsString()
  desirableRequirements?: string;

  @IsBoolean()
  @IsNotEmpty()
  willApplicantBeTested: boolean;

  @IsOptional()
  @IsDate()
  alignmentMeetingDate?: Date;

  @IsArray()
  @IsOptional()
  @IsDate({ each: true })
  suggestionsOfAlignmentMeetingDates: Date[];

  @IsNumber()
  @IsNotEmpty()
  recruiterComission: number;

  @IsBoolean()
  @IsNotEmpty()
  isReposition: boolean;
}
