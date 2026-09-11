import { ListDto } from '../../dto/list.dto';

export class TicketDto {
  film: string;
  session: string;
  daytime: string;
  row: number;
  seat: number;
  price: number;
}

export class CreateOrderDto {
  email: string;
  phone: string;
  tickets: TicketDto[];
}

export class TicketResultDto extends TicketDto {
  id: string;
}

export class GetOrderDto extends ListDto<TicketResultDto> {}
