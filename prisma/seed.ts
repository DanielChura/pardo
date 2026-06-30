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

  const categories = ['BED', 'LEASH', 'TOY'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seed executed successfully');
}

main().catch((e) => console.error(e));
