import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @Transform(({ obj, key }) => obj[key]?.trim())
  @IsNotEmpty()
  @ApiProperty({ example: 'client@example.com' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'http://localhost:1234/' })
  returnUrl: string;
}
