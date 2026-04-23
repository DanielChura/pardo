import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // Trae todos los productos activos y sus variantes de madera
  async findAll() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        variants: {
          include: {
            wood: true, // Para saber qué madera es cada variante
          },
        },
      },
    });
  }

  // Busca un producto por ID con todo su detalle de personalización
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          where: { stock: { gt: 0 } }, // Opcional: Solo traer variantes con stock
          include: {
            wood: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(data: Prisma.ProductCreateInput) {
    return await this.prisma.product.create({ data });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    // Verificamos que exista antes de actualizar
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  // Soft Delete: En lugar de borrar de la BD, lo desactivamos
  // Esto protege el historial de pedidos
  async remove(id: string) {
    const product = await this.findOne(id);

    // Si realmente quieres borrarlo de la base de datos y de Cloudinary:
    /*
    if (product.imagePublicId) {
      await this.cloudinaryService.deleteFile(product.imagePublicId);
    }
    return this.prisma.product.delete({ where: { id } });
    */

    // Recomendado: Solo desactivar
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
