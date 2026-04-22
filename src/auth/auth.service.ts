import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
      where: {
        email: body.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordVlid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordVlid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  register(body: { email: string; password: string }) {
    return this.userService.create(body);
  }
}
