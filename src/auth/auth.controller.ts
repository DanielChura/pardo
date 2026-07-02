import { Body, Controller, Post, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthDto } from './dto/auth.dto.js';
import { Cookies } from '../common/decorators/cookies.decorator.js';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: AuthDto) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: AuthDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body);
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { token: result.accessToken };
  }

  @Post('refresh')
  async refresh(
    @Cookies('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }
    const result = await this.authService.refresh(refreshToken);
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { token: result.accessToken };
  }
}
