import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '@./mail';
import { UserRepository } from '@./user';

export interface OtpRecord {
  email: string;
  otp: string;
  expiresAt: Date;
  purpose: 'password_reset' | 'email_verification';
}

@Injectable()
export class OtpService {
  private otpStore: Map<string, OtpRecord> = new Map();
  private readonly OTP_EXPIRATION_MINUTES = 10;

  constructor(
    private mailService: MailService,
    private userRepository: UserRepository,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateAndSendOtp(
    email: string,
    purpose: 'password_reset' | 'email_verification' = 'password_reset',
  ): Promise<string> {
    // Normalize email to lowercase for consistent storage
    const normalizedEmail = email.toLowerCase().trim();
    
    // For email verification during signup, user might not exist yet
    // For password reset, user must exist
    if (purpose === 'password_reset') {
      const user = await this.userRepository.findByEmail(normalizedEmail);
      if (!user) {
        throw new BadRequestException('User not found');
      }
    }

    const otp = this.generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRATION_MINUTES);

    const otpRecord: OtpRecord = {
      email: normalizedEmail,
      otp,
      expiresAt,
      purpose,
    };

    // If there's an existing OTP for this email and purpose, remove it first
    const existingRecord = this.otpStore.get(normalizedEmail);
    if (existingRecord && existingRecord.purpose === purpose) {
      console.log(`[OtpService] Replacing existing OTP for ${normalizedEmail} (purpose: ${purpose})`);
    }

    this.otpStore.set(normalizedEmail, otpRecord);
    console.log(`[OtpService] Generated OTP for ${normalizedEmail} (purpose: ${purpose}), expires at: ${expiresAt.toISOString()}, store size: ${this.otpStore.size}`);

    await this.mailService.sendOtpEmail(normalizedEmail, otp, this.OTP_EXPIRATION_MINUTES);

    return otp;
  }

  async verifyOtp(
    email: string,
    otp: string,
    purpose: 'password_reset' | 'email_verification' = 'password_reset',
  ): Promise<boolean> {
    // Normalize email to lowercase for consistent lookup
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log(`[OtpService] Verifying OTP for ${normalizedEmail} (purpose: ${purpose}), store size: ${this.otpStore.size}`);
    console.log(`[OtpService] Stored emails: ${Array.from(this.otpStore.keys()).join(', ')}`);
    
    const otpRecord = this.otpStore.get(normalizedEmail);

    if (!otpRecord) {
      console.error(`[OtpService] OTP record not found for ${normalizedEmail}`);
      throw new BadRequestException('OTP not found or expired');
    }

    console.log(`[OtpService] Found OTP record: purpose=${otpRecord.purpose}, expiresAt=${otpRecord.expiresAt.toISOString()}, current time=${new Date().toISOString()}`);

    if (otpRecord.purpose !== purpose) {
      console.error(`[OtpService] Purpose mismatch: expected ${purpose}, got ${otpRecord.purpose}`);
      throw new BadRequestException('Invalid OTP purpose');
    }

    if (otpRecord.otp !== otp) {
      console.error(`[OtpService] OTP mismatch: expected ${otpRecord.otp}, got ${otp}`);
      throw new BadRequestException('Invalid OTP');
    }

    if (new Date() > otpRecord.expiresAt) {
      console.error(`[OtpService] OTP expired: expiresAt=${otpRecord.expiresAt.toISOString()}, current=${new Date().toISOString()}`);
      this.otpStore.delete(normalizedEmail);
      throw new BadRequestException('OTP expired');
    }

    console.log(`[OtpService] OTP verified successfully for ${normalizedEmail}`);
    this.otpStore.delete(normalizedEmail);
    return true;
  }

  invalidateOtp(email: string): void {
    this.otpStore.delete(email);
  }
}

