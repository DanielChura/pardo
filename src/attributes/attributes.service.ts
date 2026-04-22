import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class AttributesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.attribute.findMany({ include: { values: true } });
  }

  findOne(id: string) {
    return this.prisma.attribute.findUniqueOrThrow({
      where: { id },
      include: { values: true },
    });
  }

  create(data: Prisma.AttributeCreateInput) {
    return this.prisma.attribute.create({ data });
  }

  update(id: string, data: Prisma.AttributeUpdateInput) {
    return this.prisma.attribute.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.attribute.delete({ where: { id } });
  }

  createValue(data: Prisma.AttributeValueCreateInput) {
    return this.prisma.attributeValue.create({ data });
  }

  removeValue(id: string) {
    return this.prisma.attributeValue.delete({ where: { id } });
  }

  updateValue(id: string, data: Prisma.AttributeValueUpdateInput) {
    return this.prisma.attributeValue.update({ where: { id }, data });
  }
}
