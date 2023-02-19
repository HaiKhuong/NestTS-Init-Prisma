import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class UpdateUsersDto {
  @IsString()
  @Transform(({ obj, key }) => obj[key]?.trim())
  @IsOptional()
  @MinLength(1)
  @ApiPropertyOptional({ example: 'client123' })
  username?: string;

  @IsEnum(Status)
  @IsOptional()
  @ApiPropertyOptional({ example: Status.ACTIVE })
  status?: Status;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  profileId: string;
}
