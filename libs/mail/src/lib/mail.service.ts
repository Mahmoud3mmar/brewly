import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailConfig } from '../../../config/src/lib/mail.config';
import { getOtpEmailTemplate } from './templates/otp-email.template';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const mailConfig = this.configService.get<MailConfig>('mail', {
      infer: true,
    });

    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      requireTLS: mailConfig.requireTls ?? !mailConfig.secure,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.password,
      },
    });
  }

  async sendOtpEmail(
    to: string,
    otp: string,
    expirationMinutes: number = 10,
  ): Promise<void> {
    const mailConfig = this.configService.get<MailConfig>('mail', {
      infer: true,
    });

    const html = getOtpEmailTemplate(otp, expirationMinutes);

    try {
      await this.transporter.sendMail({
        from: `"${mailConfig.fromName}" <${mailConfig.from}>`,
        to,
        subject: 'Your OTP Code',
        html,
      });
    } catch (error: any) {
      // Provide more helpful error message for Gmail authentication issues
      if (error.message && error.message.includes('BadCredentials')) {
        throw new Error(
          'Email service configuration error: Gmail requires an App Password. ' +
          'Please check your MAIL_USER and MAIL_PASSWORD in .env file. ' +
          'Get an App Password from: https://support.google.com/accounts/answer/185833'
        );
      }
      throw error;
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<void> {
    const mailConfig = this.configService.get<MailConfig>('mail', {
      infer: true,
    });

    await this.transporter.sendMail({
      from: `"${mailConfig.fromName}" <${mailConfig.from}>`,
      to,
      subject,
      html,
      text,
    });
  }
}

