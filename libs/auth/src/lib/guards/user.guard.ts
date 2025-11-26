import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRepository } from '../../../../../libs/user/src'; 
import { ContextProvider } from '../../../../../libs/common/src';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class UserAuthGuard extends AuthGuard('jwt') {
  constructor(
    private userRepository: UserRepository,
    private clsService: ClsService,
  ) {
    super();
    ContextProvider.setClsService(clsService);
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('[UserAuthGuard] Starting authentication check...');
    
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers?.authorization;
      console.log('[UserAuthGuard] Authorization header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'MISSING');
      
      // Check if Authorization header exists
      if (!authHeader) {
        console.error('[UserAuthGuard] Authorization header is missing');
        throw new UnauthorizedException('Authorization header is missing. Please include: Authorization: Bearer <token>');
      }
      
      // Check if it starts with "Bearer "
      if (!authHeader.startsWith('Bearer ')) {
        console.error('[UserAuthGuard] Authorization header does not start with "Bearer "');
        throw new UnauthorizedException('Invalid authorization format. Expected: Authorization: Bearer <token>');
      }
      
      // Try to activate the parent guard (JWT validation)
      console.log('[UserAuthGuard] Calling super.canActivate (JWT validation)...');
      const result = await super.canActivate(context);
      console.log('[UserAuthGuard] JWT validation result:', result);
      
      if (!result) {
        console.error('[UserAuthGuard] JWT validation returned false');
        throw new UnauthorizedException('Invalid or missing token. Please ensure you include the Authorization header: Bearer <token>');
      }

      const payload = request.user;
      console.log('[UserAuthGuard] Token payload:', payload ? { id: payload.id, email: payload.email, tokenType: payload.tokenType } : 'MISSING');

      if (!payload) {
        console.error('[UserAuthGuard] Token payload not found');
        throw new UnauthorizedException('Token payload not found. Token may be invalid or expired.');
      }

      if (!payload.tokenType) {
        console.error('[UserAuthGuard] Token missing tokenType field');
        throw new UnauthorizedException('Token missing tokenType field');
      }

      if (payload.tokenType !== 'user') {
        console.error(`[UserAuthGuard] Invalid token type. Expected 'user', got '${payload.tokenType}'`);
        throw new UnauthorizedException(`Invalid token type. Expected 'user', got '${payload.tokenType}'`);
      }

      if (!payload.id) {
        console.error('[UserAuthGuard] Token missing user ID');
        throw new UnauthorizedException('Token missing user ID');
      }

      console.log(`[UserAuthGuard] Looking up user with ID: ${payload.id}`);
      const user = await this.userRepository.findById(payload.id);
      console.log('[UserAuthGuard] User found:', user ? { id: user.id, email: user.email, isActive: user.isActive } : 'NOT FOUND');
      
      if (!user) {
        console.error(`[UserAuthGuard] User not found with ID: ${payload.id}`);
        throw new UnauthorizedException(`User not found with ID: ${payload.id}`);
      }

      if (!user.isActive) {
        console.error('[UserAuthGuard] User is inactive');
        throw new UnauthorizedException('User is inactive');
      }

      ContextProvider.setAuthUser(user);
      console.log('[UserAuthGuard] Authentication successful');
      return true;
    } catch (error: any) {
      console.error('[UserAuthGuard] Error caught:', {
        name: error?.name,
        message: error?.message,
        status: error?.status,
        statusCode: error?.statusCode,
        stack: error?.stack,
      });
      
      // If it's already an UnauthorizedException, re-throw it with the message
      if (error instanceof UnauthorizedException) {
        console.error('[UserAuthGuard] Re-throwing UnauthorizedException:', error.message);
        throw error;
      }
      
      // Handle Passport-specific errors
      if (error?.name === 'JsonWebTokenError') {
        console.error('[UserAuthGuard] JsonWebTokenError:', error.message);
        throw new UnauthorizedException(`Invalid token: ${error.message}`);
      }
      
      if (error?.name === 'TokenExpiredError') {
        console.error('[UserAuthGuard] TokenExpiredError');
        throw new UnauthorizedException('Token has expired. Please sign up again to get a new token.');
      }
      
      if (error?.name === 'NotBeforeError') {
        console.error('[UserAuthGuard] NotBeforeError');
        throw new UnauthorizedException('Token not active yet');
      }
      
      // Handle other Passport errors
      if (error?.status === 401 || error?.statusCode === 401) {
        console.error('[UserAuthGuard] Passport 401 error:', error.message);
        throw new UnauthorizedException(error.message || 'Authentication failed');
      }
      
      // Generic error fallback with more details
      const errorMessage = error?.message || error?.toString() || 'Unknown authentication error';
      console.error('[UserAuthGuard] Generic error:', errorMessage);
      throw new UnauthorizedException(`Authentication failed: ${errorMessage}`);
    }
  }
}

