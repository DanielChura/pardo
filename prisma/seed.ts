import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@pardo.com' },
    update: {},
    create: {
      email: 'admin@pardo.com',
      password: password,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  await prisma.category.upsert({
    create: {
      name: 'Beds',
      slug: 'beds',
    },
    update: {},
    where: {
      name: 'Beds',
    },
  });

  await prisma.category.upsert({
    create: {
      name: 'Collars',
      slug: 'collars',
    },
    update: {},
    where: {
      name: 'Collars',
    },
  });

  await prisma.category.upsert({
    create: {
      name: 'Leashes',
      slug: 'leashes',
    },
    update: {},
    where: {
      name: 'Leashes',
    },
  });

  await prisma.color.upsert({
    create: { name: 'Crimson', hex: '#DC2626' },
    update: {},
    where: { hex: '#DC2626' },
  });

  await prisma.color.upsert({
    create: { name: 'Navy', hex: '#1E3A5F' },
    update: {},
    where: { hex: '#1E3A5F' },
  });

  await prisma.color.upsert({
    create: { name: 'Sage', hex: '#87A878' },
    update: {},
    where: { hex: '#87A878' },
  });

  console.log('Seed executed successfully');
}

main().catch((e) => console.error(e));
