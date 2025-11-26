import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from '@./config';
import { TokenTypeEnum } from '../../enums/token-type.enum';
import { AdminJwtPayloadType } from '../../strategies/types/jwt-payload.type';

@Injectable()
export class AdminAuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<{ token: string }> {
    // TODO: Implement admin authentication logic
    // For now, this is a placeholder
    const authConfig = this.configService.get<AuthConfig>('auth', {
      infer: true,
    });

    const payload: AdminJwtPayloadType = {
      id: 1,
      email,
      tokenType: TokenTypeEnum.ADMIN,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: authConfig.expires,
    });

    return { token };
  }
}

