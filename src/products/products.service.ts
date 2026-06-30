import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

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
        variants: { include: { wood: true } },
        images: { orderBy: { orderIndex: 'asc' } },
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          where: { stock: { gt: 0 } },
          include: { wood: true },
        },
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

  async addImages(
    id: string,
    files: Express.Multer.File[],
    orderIndices?: string | string[],
  ) {
    const product = await this.findOne(id);

    let indices: number[];
    if (orderIndices !== undefined) {
      const arr = Array.isArray(orderIndices) ? orderIndices : [orderIndices];
      if (arr.length !== files.length) {
        throw new BadRequestException(
          `orderIndices length (${arr.length}) must match files length (${files.length})`,
        );
      }
      indices = arr.map((v) => {
        const n = Number(v);
        if (isNaN(n)) throw new BadRequestException(`Invalid orderIndex: ${v}`);
        return n;
      });
    } else {
      const maxOrder = await this.prisma.productImage.findFirst({
        where: { productId: id },
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true },
      });
      let nextIndex = (maxOrder?.orderIndex ?? -1) + 1;
      indices = files.map(() => nextIndex++);
    }

    const productImages: Prisma.ProductImageCreateManyInput[] = [];

    for (let i = 0; i < files.length; i++) {
      const { secure_url, public_id } =
        await this.cloudinaryService.uploadFile(files[i]);

      productImages.push({
        productId: product.id,
        imageUrl: secure_url,
        imagePublicId: public_id,
        orderIndex: indices[i],
      });
    }

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
