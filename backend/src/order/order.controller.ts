import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CreateOrderDto, GetOrderDto } from './dto/order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<GetOrderDto> {
    return this.orderService.create(createOrderDto);
  }
}
