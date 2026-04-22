import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { OrdersService } from './orders.service.js';

interface OrderItemInput {
  productId: string;
  quantity: number;
  attributeValueIds: string[];
}

interface CreateOrderBody {
  userId: string;
  items: OrderItemInput[];
  notes?: string;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.ordersService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateOrderBody) {
    return this.ordersService.create(body);
  }
}
