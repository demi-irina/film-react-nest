import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';

import { ListDto } from '../../dto/list.dto';
import { UniqueSeatsConstraint } from './unique-seats.validator';

export class TicketDto {
  @IsString({ message: 'Не указан фильм' })
  @IsNotEmpty({ message: 'Не указан фильм' })
  film: string;

  @IsString({ message: 'Не указан сеанс' })
  @IsNotEmpty({ message: 'Не указан сеанс' })
  session: string;

  @IsString({ message: 'Не указано время сеанса' })
  @IsNotEmpty({ message: 'Не указано время сеанса' })
  daytime: string;

  @IsInt({ message: 'Некорректный ряд' })
  @Min(1, { message: 'Некорректный ряд' })
  row: number;

  @IsInt({ message: 'Некорректное место' })
  @Min(1, { message: 'Некорректное место' })
  seat: number;

  @IsNumber({}, { message: 'Некорректная цена билета' })
  @Min(0, { message: 'Некорректная цена билета' })
  price: number;
}

export class CreateOrderDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString({ message: 'Не указан телефон' })
  @IsNotEmpty({ message: 'Не указан телефон' })
  phone: string;

  @IsArray({ message: 'Некорректный список билетов' })
  @ArrayNotEmpty({ message: 'Список билетов пуст' })
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  @Validate(UniqueSeatsConstraint)
  tickets: TicketDto[];
}

export class TicketResultDto extends TicketDto {
  id: string;
}

export class GetOrderDto extends ListDto<TicketResultDto> {}
