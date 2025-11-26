import { Module } from '@nestjs/common';
import { AuthController } from './controllers/v1/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthModule as AuthLibModule } from '../../../../../../libs/auth/src';
import { UserModule } from '../../../../../../libs/user/src';

@Module({
  imports: [AuthLibModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class ApiAuthModule {}

