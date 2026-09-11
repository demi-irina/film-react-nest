import { Injectable } from '@nestjs/common';

import { CreateOrderDto, GetOrderDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  async create(createOrderDto: CreateOrderDto): Promise<GetOrderDto> {
    void createOrderDto;
    return { total: 0, items: [] };
  }
}
