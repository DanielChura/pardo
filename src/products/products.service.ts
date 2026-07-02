import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, Product } from '../generated/prisma/client.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { slugify } from '../utils/slug.utils.js';
import {
  CreateProductDto,
  UploadProductImageDTO,
} from './dto/createProductDTO.js';
import { UpdateProductDto } from './dto/updateProductDTO.js';
import { PaginationDto, toPagination } from 'src/common/dto/pagination.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const skip = (page - 1) * limit;
    const where = { isActive: true };

    const [data, totalItems] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          variants: true,
          images: true,
          category: true,
        },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return toPagination(data, totalItems, limit, page);
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: true,
        category: true,
      },
    });

    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async create(data: CreateProductDto) {
    await this.getCategory(data.categoryId);
    const slug = slugify(data.name);
    await this.existProduct(slug);
    return this.prisma.product.create({ data: { ...data, slug } });
  }

  async update(id: string, data: UpdateProductDto) {
    await this.findOne(id);
    const { categoryId, ...rest } = data;
    const updateData: Prisma.ProductUpdateInput = { ...rest };
    if (categoryId) {
      updateData.category = { connect: { id: categoryId } };
    }
    return this.prisma.product.update({ where: { id }, data: updateData });
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

  private async getCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async existProduct(slug: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct)
      throw new BadRequestException(`Product with slug ${slug} already exists`);
  }
}
