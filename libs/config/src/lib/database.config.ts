import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  maxConnections: number;
  sslEnabled: boolean;
  url?: string;
}

export default registerAs<DatabaseConfig>('database', () => ({
  type: (process.env['DATABASE_TYPE'] || 'postgres') as 'postgres',
  host: process.env['DATABASE_HOST'] || 'localhost',
  port: parseInt(process.env['DATABASE_PORT'] || '5432', 10),
  username: process.env['DATABASE_USERNAME'] || 'postgres',
  password: process.env['DATABASE_PASSWORD'] || 'postgres',
  database: process.env['DATABASE_NAME'] || 'brewly',
  synchronize: true,
  maxConnections: parseInt(process.env['DATABASE_MAX_CONNECTIONS'] || '10', 10),
  sslEnabled: process.env['DATABASE_SSL_ENABLED'] === 'true',
  url: process.env['DATABASE_URL'],
}));

