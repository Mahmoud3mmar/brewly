import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from './utils/snake-naming-strategy.utils';
import { DatabaseConfig } from '../../../../libs/config/src/lib/database.config';  
import { User } from '../../../../libs/user/src';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<DatabaseConfig>('database', {
          infer: true,
        });

        // If DATABASE_URL is provided (e.g., Neon PostgreSQL), use it directly
        if (dbConfig.url) {
          // Neon PostgreSQL requires SSL, so we enable it when using DATABASE_URL
          const requiresSSL = dbConfig.url.includes('sslmode=require') || dbConfig.sslEnabled;
          
          return {
            type: 'postgres',
            url: dbConfig.url,
            synchronize: dbConfig.synchronize,
            logging: process.env['NODE_ENV'] === 'development',
            entities: [User],
            migrations: [],
            namingStrategy: new SnakeNamingStrategy(),
            extra: {
              max: dbConfig.maxConnections,
              ssl: requiresSSL
                ? {
                    rejectUnauthorized: dbConfig.rejectUnauthorized ?? false,
                    ca: dbConfig.ca,
                    key: dbConfig.key,
                    cert: dbConfig.cert,
                  }
                : false,
            },
          };
        }

        // Otherwise, use individual connection parameters
        const options: DataSourceOptions = {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          synchronize: dbConfig.synchronize,
          logging: process.env['NODE_ENV'] === 'development',
          entities: [User],
          migrations: [],
          namingStrategy: new SnakeNamingStrategy(),
          extra: {
            max: dbConfig.maxConnections,
            ssl: dbConfig.sslEnabled
              ? {
                  rejectUnauthorized: dbConfig.rejectUnauthorized ?? false,
                  ca: dbConfig.ca,
                  key: dbConfig.key,
                  cert: dbConfig.cert,
                }
              : false,
          },
        };

        return options;
      },
      inject: [ConfigService],
      dataSourceFactory: async (options: DataSourceOptions | undefined) => {
        if (!options) {
          throw new Error('Database configuration is missing');
        }
        const dataSource = new DataSource(options);
        return dataSource.initialize();
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

