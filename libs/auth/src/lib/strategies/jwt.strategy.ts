import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from '../../../../../libs/config/src/lib/auth.config';
import { JwtPayloadType } from './types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const authConfig = configService.get<AuthConfig>('auth', { infer: true });
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.secret,
    });
  }

  async validate(payload: any): Promise<JwtPayloadType> {
    console.log('[JwtStrategy] Validating payload:', payload ? { id: payload.id, email: payload.email, tokenType: payload.tokenType } : 'NULL');
    
    if (!payload) {
      console.error('[JwtStrategy] Payload is null or undefined');
      throw new UnauthorizedException('Invalid token payload');
    }
    
    if (!payload.id || !payload.email || !payload.tokenType) {
      console.error('[JwtStrategy] Payload missing required fields:', {
        hasId: !!payload.id,
        hasEmail: !!payload.email,
        hasTokenType: !!payload.tokenType,
      });
      throw new UnauthorizedException('Token payload is missing required fields');
    }
    
    console.log('[JwtStrategy] Payload validation successful');
    return payload as JwtPayloadType;
  }
}

