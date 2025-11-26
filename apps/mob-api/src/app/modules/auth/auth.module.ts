import { Module } from '@nestjs/common';
import { AuthController } from './controllers/v1/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthModule as AuthLibModule } from '@./auth';
import { UserModule } from '@./user';

@Module({
  imports: [AuthLibModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class ApiAuthModule {}

