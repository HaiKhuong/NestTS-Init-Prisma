import { Gender } from '@enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxDate,
  MaxLength,
  MinLength,
} from 'class-validator';
import * as moment from 'moment';

export class RegisterUserDto {
  @IsString()
  @Transform(({ obj, key }) => obj[key]?.trim())
  @IsNotEmpty()
  @ApiProperty({ example: 'client123' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '123123' })
  password: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  @MinLength(10)
  @ApiProperty({ example: '' })
  phone: string;

  @IsString()
  @Transform(({ obj, key }) => obj[key]?.trim())
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  @MinLength(1)
  @ApiProperty({ example: '' })
  idCardNumber: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  @ApiProperty({ example: Gender.MALE })
  gender: Gender;

  @IsDate()
  @IsNotEmpty()
  @MaxDate(moment().subtract(1, 'days').utcOffset(7, true).toDate())
  @ApiProperty({ example: moment().utcOffset(7, true).toDate() })
  dateOfBirth: Date;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  address: string;

  @IsDate()
  @IsNotEmpty()
  @MaxDate(moment().subtract(1, 'days').utcOffset(7, true).toDate())
  @ApiProperty({ example: moment().utcOffset(7, true).toDate() })
  issueDate: Date;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  placeOfIssue: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  permanentResidence: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  nationality: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '' })
  socialLink?: string;

  @IsEnum(Status)
  @IsOptional()
  @ApiPropertyOptional({ example: Status.ACTIVE })
  status?: Status;
}
