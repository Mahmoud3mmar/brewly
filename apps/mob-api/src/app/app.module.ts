import { Module } from '@nestjs/common';
import { ConfigModule } from '../../../../libs/config/src';
import { DatabaseModule } from '../../../../libs/database/src';
import { CommonModule } from '../../../../libs/common/src';
import { AuthModule } from '../../../../libs/auth/src';
import { UserModule } from '../../../../libs/user/src';
import { MailModule } from '../../../../libs/mail/src';
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
