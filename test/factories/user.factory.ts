import { PrismaService } from '../../src/prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

export interface CreateUserParams {
  email?: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
}

export async function createUser(
  prisma: PrismaService,
  overrides: CreateUserParams = {},
) {
  const password = overrides.password || 'test123';
  const hashedPassword = await bcrypt.hash(password, 6);

  const defaults = {
    email: `user-${Date.now()}@test.com`,
    password: hashedPassword,
    role: 'USER' as const,
  };
  const { password: _, ...rest } = overrides;
  const data = { ...defaults, ...rest };
  return prisma.user.create({ data });
}
