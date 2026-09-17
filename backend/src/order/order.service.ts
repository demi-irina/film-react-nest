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
    const tickets = createOrderDto.tickets;

    for (const ticket of tickets) {
      const session = await this.findSession(ticket);
      this.assertSeatExists(ticket, session);
      this.assertSeatIsFree(ticket, session);
    }

    const items = await this.bookTickets(tickets);

    return { total: items.length, items };
  }

  private async bookTickets(tickets: TicketDto[]): Promise<TicketResultDto[]> {
    const takenSeat = await this.filmsRepository.bookSeats(
      tickets.map((ticket) => ({
        filmId: ticket.film,
        sessionId: ticket.session,
        seat: OrderService.getPlace(ticket),
      })),
    );

    if (takenSeat) {
      throw new BadRequestException({
        error: `Место ${takenSeat} уже занято`,
      });
    }

    return tickets.map((ticket) => ({ ...ticket, id: randomUUID() }));
  }

  private static getPlace(ticket: TicketDto): string {
    return `${ticket.row}:${ticket.seat}`;
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
