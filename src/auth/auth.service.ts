import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async login(body: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    const isValid =
      user && (await bcrypt.compare(body.password, user.password));
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  register(body: { email: string; password: string }) {
    return this.userService.create(body);
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    const newAccessToken = this.createAccessToken(user);
    const newRefreshToken = await this.createRefreshToken(user.id);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  private createAccessToken(user: any): string {
    return this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const { randomUUID } = await import('crypto');
    const token = randomUUID();
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return token;
  }
}
