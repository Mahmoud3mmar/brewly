import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  secret: string;
  expires: string;
}

export default registerAs<AuthConfig>('auth', () => ({
  secret: process.env['AUTH_SECRET'] || 'your-secret-key',
  expires: process.env['AUTH_EXPIRES'] || '7d',
}));

