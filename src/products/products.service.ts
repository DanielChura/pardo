import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { UploadProductImageDTO } from './dto/createProductDTO.js';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  findAll() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        variants: true,
        images: { orderBy: { orderIndex: 'asc' } },
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addImages(id: string, images: UploadProductImageDTO[]) {
    const product = await this.findOne(id);
    const productImages = images.map((i) => ({ productId: product.id, ...i }));

    return this.prisma.productImage.createMany({
      data: productImages,
    });
  }

  async deleteImage(productId: string, imageId: string) {
    await this.findOne(productId);

    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.productId !== productId) {
      throw new NotFoundException(
        `Image with ID ${imageId} not found for this product`,
      );
    }

    await this.cloudinaryService.deleteFile(image.imagePublicId);

    return this.prisma.productImage.delete({
      where: { id: imageId },
    });
  }
}
