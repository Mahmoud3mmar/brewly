import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  apiPrefix: string;
  nodeEnv: string;
}

export default registerAs<AppConfig>('app', () => ({
  port: parseInt(process.env['APP_PORT'] || process.env['PORT'] || '3000', 10),
  apiPrefix: process.env['API_PREFIX'] || 'api',
  nodeEnv: process.env['NODE_ENV'] || 'development',
}));

