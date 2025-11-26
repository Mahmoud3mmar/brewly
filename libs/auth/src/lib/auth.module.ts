import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from '../../../../libs/config/src/lib/auth.config.js';
import { UserPersistenceModule } from '../../../../libs/user/src';
import { MailModule } from '../../../../libs/mail/src';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminAuthService } from './application/services/admin-auth.service';
import { UserAuthService } from './application/services/user-auth.service';
import { OtpService } from './application/services/otp.service';
import { UserAuthGuard } from './guards/user.guard';
import { AdminAuthGuard } from './guards/admin.guard';

@Module({
  imports: [
    PassportModule,
    UserPersistenceModule,
    MailModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const authConfig = configService.get<AuthConfig>('auth', {
          infer: true,
        });
        return {
          secret: authConfig.secret,
          signOptions: {
            expiresIn: authConfig.expires,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtStrategy,
    AdminAuthService,
    UserAuthService,
    OtpService,
    UserAuthGuard,
    AdminAuthGuard,
  ],
  exports: [AdminAuthService, UserAuthService, OtpService, UserAuthGuard, AdminAuthGuard],
})
export class AuthModule {}

