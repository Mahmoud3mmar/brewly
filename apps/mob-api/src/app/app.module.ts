import { Module } from '@nestjs/common';
import { ConfigModule } from '@./config';
import { DatabaseModule } from '@./database';
import { CommonModule } from '@./common';
import { AuthModule } from '@./auth';
import { UserModule } from '@./user';
import { MailModule } from '@./mail';
import { ApiAuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.register([]),
    DatabaseModule,
    CommonModule.register(true, {}, 'mob-api'),
    AuthModule,
    UserModule,
    MailModule,
    ApiAuthModule,
  ],
})
export class AppModule {}
