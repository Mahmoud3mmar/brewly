import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtpVerifyDto {
  @ApiProperty({ example: '123456', description: 'OTP code received via email' })
  @IsString()
  @IsNotEmpty()
  otp!: string;
}

