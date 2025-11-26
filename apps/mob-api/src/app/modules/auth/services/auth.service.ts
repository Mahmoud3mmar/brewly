import { Injectable } from '@nestjs/common';
import { UserAuthService } from '@./auth';
import { UserProfileDto } from '@./contract';
import { User } from '@./user';

@Injectable()
export class AuthService {
  constructor(private userAuthService: UserAuthService) {}

  async signup(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string,
  ) {
    return this.userAuthService.signup(email, password, firstName, lastName, phoneNumber);
  }

  async verifyEmail(userId: number, otp: string) {
    return this.userAuthService.verifyEmail(userId, otp);
  }

  async resendVerificationOtp(userId: number) {
    return this.userAuthService.resendVerificationOtp(userId);
  }

  async login(email: string, password: string) {
    return this.userAuthService.login(email, password);
  }

  async requestPasswordReset(email: string) {
    return this.userAuthService.requestPasswordReset(email);
  }

  async confirmPasswordReset(email: string, otp: string, newPassword: string) {
    return this.userAuthService.confirmPasswordReset(email, otp, newPassword);
  }

  async getProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.userAuthService.getProfile(userId);
    return new UserProfileDto(user);
  }
}

