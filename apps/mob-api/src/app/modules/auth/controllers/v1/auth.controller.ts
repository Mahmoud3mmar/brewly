import {
  Controller,
  Post,
  Get,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ControllerDecorator, ResponseGenerator } from '../../../../../../../../libs/common/src';
import { UserAuth } from '../../../../../../../../libs/auth/src';
import { ContextProvider } from '../../../../../../../../libs/common/src';
import {
  UserSignupDto,
  UserLoginDto,
  PasswordResetDto,
  PasswordResetConfirmDto,
  UserProfileDto,
  OtpVerifyDto,
} from '../../../../../../../../libs/contract/src/lib/website/v1';
import { AuthService } from '../../services/auth.service';

@ApiTags('auth')
@ControllerDecorator('v1', 'auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration (sends OTP to email for verification)' })
  @ApiBody({ type: UserSignupDto })
  @ApiResponse({ status: 201, description: 'User successfully registered. OTP sent to email.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async signup(@Body() dto: UserSignupDto) {
    const result = await this.authService.signup(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
      dto.phoneNumber,
    );
    return ResponseGenerator.generateResourceFormat({
      user: new UserProfileDto(result.user),
      token: result.token,
      message: result.message,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login (requires verified email)' })
  @ApiBody({ type: UserLoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or email not verified' })
  async login(@Body() dto: UserLoginDto) {
    const result = await this.authService.login(dto.email, dto.password);
    return ResponseGenerator.generateResourceFormat({
      user: new UserProfileDto(result.user),
      token: result.token,
    });
  }

  @Post('verify-email')
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify email with OTP code (requires authentication token)' })
  @ApiBody({ type: OtpVerifyDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or email already verified' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyEmail(@Body() dto: OtpVerifyDto) {
    console.log('[AuthController] verifyEmail called with OTP:', dto.otp);
    const user = ContextProvider.getAuthUser();
    console.log('[AuthController] Authenticated user:', { id: user.id, email: user.email });
    const result = await this.authService.verifyEmail(user.id, dto.otp);
    console.log('[AuthController] verifyEmail result:', result);
    return ResponseGenerator.generateResourceFormat(result);
  }

  @Post('resend-verification-otp')
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Resend verification OTP to email (requires authentication token)' })
  @ApiResponse({ status: 200, description: 'Verification OTP sent to email' })
  @ApiResponse({ status: 400, description: 'Email already verified' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resendVerificationOtp() {
    const user = ContextProvider.getAuthUser();
    const result = await this.authService.resendVerificationOtp(user.id);
    return ResponseGenerator.generateResourceFormat(result);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset (sends OTP via email)' })
  @ApiBody({ type: PasswordResetDto })
  @ApiResponse({ status: 200, description: 'OTP sent to email' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async requestPasswordReset(@Body() dto: PasswordResetDto) {
    console.log('[AuthController] Password reset requested for email:', dto.email);
    const result = await this.authService.requestPasswordReset(dto.email);
    return ResponseGenerator.generateResourceFormat(result);
  }

  @Post('password/reset/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm password reset with OTP' })
  @ApiBody({ type: PasswordResetConfirmDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or bad request' })
  async confirmPasswordReset(@Body() dto: PasswordResetConfirmDto) {
    console.log('[AuthController] Password reset confirmation for email:', dto.email, 'OTP:', dto.otp);
    const result = await this.authService.confirmPasswordReset(
      dto.email,
      dto.otp,
      dto.newPassword,
    );
    return ResponseGenerator.generateResourceFormat(result);
  }

  @Get('profile')
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved', type: UserProfileDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile() {
    const user = ContextProvider.getAuthUser();
    const profile = await this.authService.getProfile(user.id);
    return ResponseGenerator.generateResourceFormat(profile);
  }

  
}

