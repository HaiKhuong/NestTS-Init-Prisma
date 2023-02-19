import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateUsersDto {
  @IsString()
  @Transform(({ obj, key }) => obj[key]?.trim())
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  profileId: string;

  @IsEnum(Status)
  @IsNotEmpty()
  @ApiProperty({ example: Status.ACTIVE })
  status: Status;
}
