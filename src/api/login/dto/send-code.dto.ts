import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendCodeDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'client@example.com' })
  email: string;

  @IsString()
  @Transform(({ obj, key }) => obj[key]?.trim())
  @IsNotEmpty()
  @ApiProperty({ example: 'Felix' })
  firstName: string;

  @IsString()
  @Transform(({ obj, key }) => obj[key]?.trim())
  @IsNotEmpty()
  @ApiProperty({ example: 'Keller' })
  lastName: string;
}
