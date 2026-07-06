import { PrismaService } from '../../src/prisma/prisma.service.js';

export async function createColor(
  prisma: PrismaService,
  overrides: { name?: string; hex?: string; id?: string } = {},
) {
  const defaults = {
    name: 'Color Test',
    hex: '#FFFFFF',
  };
  const data = { ...defaults, ...overrides };
  return prisma.color.create({ data });
}
