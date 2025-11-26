import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../../../../../libs/user/src';
import { User } from '../../../../../../libs/user/src';
import { AuthConfig } from '../../../../../../libs/config/src/lib/auth.config';
import { TokenTypeEnum } from '../../enums/token-type.enum';
import { UserJwtPayloadType } from '../../strategies/types/jwt-payload.type';
import { OtpService } from './otp.service';

@Injectable()
export class UserAuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
  ) {}

  async signup(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string,
  ): Promise<{ user: User; token: string; message: string }> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      emailVerified: false,
      isActive: true,
    });

    // Send OTP for email verification
    try {
      await this.otpService.generateAndSendOtp(email, 'email_verification');
    } catch (error) {
      // If email sending fails, still create the user but log the error
      // User can request resend verification OTP later
      console.error('Failed to send verification email:', error);
    }

    const token = this.generateToken(user);

    return { 
      user, 
      token,
      message: 'Registration successful. Please verify your email with the OTP sent to your inbox.' 
    };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in. Check your inbox for the verification code.');
    }

    const token = this.generateToken(user);

    return { user, token };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      await this.otpService.generateAndSendOtp(email, 'password_reset');
      return { message: 'OTP sent to your email' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      return { message: 'If the email exists, an OTP has been sent' };
    }
  }

  async confirmPasswordReset(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // First verify the user exists
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found with this email address. Please check your email and try again.');
    }

    // Then verify the OTP
    try {
      await this.otpService.verifyOtp(email, otp, 'password_reset');
    } catch (error) {
      if (error instanceof BadRequestException) {
        // Provide more helpful error message
        if (error.message.includes('not found')) {
          throw new BadRequestException('OTP not found. Please request a new password reset OTP. Make sure you use the same email address you used to request the reset.');
        }
        throw error;
      }
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, { password: hashedPassword });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(userId: number, otp: string): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.otpService.verifyOtp(user.email, otp, 'email_verification');

    await this.userRepository.update(user.id, { emailVerified: true });

    return { 
      message: 'Email verified successfully'
    };
  }

  async resendVerificationOtp(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.otpService.generateAndSendOtp(user.email, 'email_verification');

    return { message: 'Verification OTP sent to your email' };
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private generateToken(user: User): string {
    const authConfig = this.configService.get<AuthConfig>('auth', {
      infer: true,
    });

    const payload: UserJwtPayloadType = {
      id: user.id,
      email: user.email,
      tokenType: TokenTypeEnum.USER,
    };

    return this.jwtService.sign(payload, {
      expiresIn: authConfig.expires,
    });
  }
}

