import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address to send OTP' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

