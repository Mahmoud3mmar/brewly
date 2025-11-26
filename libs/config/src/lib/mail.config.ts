import { registerAs } from '@nestjs/config';

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  requireTls?: boolean;
  user: string;
  password: string;
  from: string;
  fromName: string;
}

export default registerAs<MailConfig>('mail', () => ({
  host: process.env['MAIL_HOST'] || 'smtp.gmail.com',
  port: parseInt(process.env['MAIL_PORT'] || '587', 10),
  secure: process.env['MAIL_SECURE'] === 'true',
  requireTls: process.env['MAIL_REQUIRE_TLS'] === 'true',
  user: process.env['MAIL_USER'] || '',
  password: process.env['MAIL_PASSWORD'] || '',
  from: process.env['MAIL_FROM'] || process.env['MAIL_DEFAULT_EMAIL'] || 'noreply@brewly.com',
  fromName: process.env['MAIL_FROM_NAME'] || process.env['MAIL_DEFAULT_NAME'] || 'Brewly',
}));

