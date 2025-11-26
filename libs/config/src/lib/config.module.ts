import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import authConfig from './auth.config';
import mailConfig from './mail.config';
import appConfig from './app.config';

@Module({})
export class ConfigModule {
  static register(configs: any[] = []): DynamicModule {
    return {
      module: ConfigModule,
      imports: [
        NestConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfig,
            databaseConfig,
            authConfig,
            mailConfig,
            ...configs,
          ],
          envFilePath: ['.env.local', '.env'],
        }),
      ],
      exports: [NestConfigModule],
    };
  }
}

