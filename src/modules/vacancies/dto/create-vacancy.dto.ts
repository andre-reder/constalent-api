import {
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
  open = 'open',
  canceled = 'canceled',
  finished = 'finished',
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
  commission: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  companyId: string;
}
