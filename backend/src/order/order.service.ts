import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import {
  CreateOrderDto,
  GetOrderDto,
  TicketDto,
  TicketResultDto,
} from './dto/order.dto';
import { ScheduleDto } from '../films/dto/films.dto';
import {
  FILMS_REPOSITORY,
  FilmsRepository,
} from '../repository/films.repository';

@Injectable()
export class OrderService {
  constructor(
    @Inject(FILMS_REPOSITORY) private readonly filmsRepository: FilmsRepository,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<GetOrderDto> {
    const tickets = createOrderDto?.tickets;

    if (!Array.isArray(tickets) || tickets.length === 0) {
      throw new BadRequestException({ error: 'Список билетов пуст' });
    }

    tickets.forEach((ticket) => this.assertTicketIsValid(ticket));
    this.assertNoDuplicates(tickets);

    for (const ticket of tickets) {
      const session = await this.findSession(ticket);
      this.assertSeatExists(ticket, session);
      this.assertSeatIsFree(ticket, session);
    }

    const items: TicketResultDto[] = [];
    for (const ticket of tickets) {
      const booked = await this.filmsRepository.addTakenSeat(
        ticket.film,
        ticket.session,
        OrderService.getPlace(ticket),
      );

      if (!booked) {
        throw new BadRequestException({
          error: `Место ${OrderService.getPlace(ticket)} уже занято`,
        });
      }

      items.push({ ...ticket, id: randomUUID() });
    }

    return { total: items.length, items };
  }

  private static getPlace(ticket: TicketDto): string {
    return `${ticket.row}:${ticket.seat}`;
  }

  private assertTicketIsValid(ticket: TicketDto): void {
    if (
      typeof ticket?.film !== 'string' ||
      typeof ticket?.session !== 'string'
    ) {
      throw new BadRequestException({
        error: 'Не указан фильм или сеанс',
      });
    }

    if (!Number.isInteger(ticket.row) || !Number.isInteger(ticket.seat)) {
      throw new BadRequestException({
        error: `Некорректные координаты кресла: ${OrderService.getPlace(ticket)}`,
      });
    }
  }

  private assertNoDuplicates(tickets: TicketDto[]): void {
    const places = new Set<string>();

    for (const ticket of tickets) {
      const key = `${ticket.film}:${ticket.session}:${OrderService.getPlace(ticket)}`;

      if (places.has(key)) {
        throw new BadRequestException({
          error: `Место ${OrderService.getPlace(ticket)} указано в заказе дважды`,
        });
      }

      places.add(key);
    }
  }

  private async findSession(ticket: TicketDto): Promise<ScheduleDto> {
    const film = await this.filmsRepository.findById(ticket.film);

    if (!film) {
      throw new NotFoundException({ error: `Фильм ${ticket.film} не найден` });
    }

    const session = film.schedule.find(({ id }) => id === ticket.session);

    if (!session) {
      throw new NotFoundException({
        error: `Сеанс ${ticket.session} не найден`,
      });
    }

    return session;
  }

  private assertSeatExists(ticket: TicketDto, session: ScheduleDto): void {
    const isValidRow = ticket.row >= 1 && ticket.row <= session.rows;
    const isValidSeat = ticket.seat >= 1 && ticket.seat <= session.seats;

    if (!isValidRow || !isValidSeat) {
      throw new BadRequestException({
        error: `Места ${OrderService.getPlace(ticket)} нет в зале`,
      });
    }
  }

  private assertSeatIsFree(ticket: TicketDto, session: ScheduleDto): void {
    if (session.taken.includes(OrderService.getPlace(ticket))) {
      throw new BadRequestException({
        error: `Место ${OrderService.getPlace(ticket)} уже занято`,
      });
    }
  }
}
