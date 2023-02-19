import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FilterUsersDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '' })
  search?: string;

  @IsEnum(Status)
  @IsOptional()
  @ApiPropertyOptional({ example: Status.ACTIVE })
  status?: Status;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'id1, id2' })
  departments?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'id1, id2' })
  positions?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'id1, id2' })
  roleIds?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiPropertyOptional({ example: 10 })
  pageSize?: number;
}
