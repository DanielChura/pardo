import { PrismaService } from '../../src/prisma/prisma.service.js';

export async function createProductVariant(
  prisma: PrismaService,
  productId: string,
  colorId: string,
  overrides: {
    size?: string;
    price?: number;
    stock?: number;
    id?: string;
  } = {},
) {
  const defaults = {
    size: 'M',
    dimensions: '30x40',
    price: 5000,
    stock: 10,
  };
  const { id, ...rest } = overrides;
  const data = {
    ...defaults,
    ...rest,
    id,
    productId,
    colorId,
  };
  return prisma.productVariant.create({ data });
}
