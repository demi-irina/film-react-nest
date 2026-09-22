import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateOrderDto, TicketDto } from './dto/order.dto';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { FilmWithScheduleDto, ScheduleDto } from '../films/dto/films.dto';
import {
  FILMS_REPOSITORY,
  FilmsRepository,
} from '../repository/films.repository';

const FILM_ID = '11111111-1111-1111-1111-111111111111';
const SESSION_ID = '22222222-2222-2222-2222-222222222222';
const MISSING_SESSION_ID = '33333333-3333-3333-3333-333333333333';

const schedule: ScheduleDto = {
  id: SESSION_ID,
  daytime: '2026-01-01T10:00:00.000Z',
  hall: 0,
  rows: 5,
  seats: 10,
  price: 350,
  taken: ['1:1'],
};

const film: FilmWithScheduleDto = {
  id: FILM_ID,
  rating: 2.9,
  director: 'Итан Райт',
  tags: ['Драма'],
  title: 'Архитекторы общества',
  about: 'Документальный фильм',
  description: 'Документальный фильм Итана Райта',
  image: '/bg1s.jpg',
  cover: '/bg1c.jpg',
  schedule: [schedule],
};

const createTicket = (overrides: Partial<TicketDto> = {}): TicketDto => ({
  film: FILM_ID,
  session: SESSION_ID,
  daytime: schedule.daytime,
  row: 2,
  seat: 3,
  price: schedule.price,
  ...overrides,
});

const createOrder = (tickets: TicketDto[]): CreateOrderDto => ({
  email: 'user@example.com',
  phone: '+79001234567',
  tickets,
});

describe('OrderController', () => {
  let controller: OrderController;
  let repository: jest.Mocked<FilmsRepository>;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(film),
      bookSeats: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        OrderService,
        { provide: FILMS_REPOSITORY, useValue: repository },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  describe('POST /order', () => {
    it('бронирует место и возвращает билет с идентификатором', async () => {
      const ticket = createTicket();

      const result = await controller.createOrder(createOrder([ticket]));

      expect(result.total).toBe(1);
      expect(result.items).toEqual([{ ...ticket, id: expect.any(String) }]);
      expect(repository.bookSeats).toHaveBeenCalledWith([
        { filmId: FILM_ID, sessionId: SESSION_ID, seat: '2:3' },
      ]);
    });

    it('бронирует все места в заказе одним обращением к репозиторию', async () => {
      const tickets = [createTicket(), createTicket({ row: 2, seat: 4 })];

      const result = await controller.createOrder(createOrder(tickets));

      expect(result.total).toBe(2);
      expect(repository.bookSeats).toHaveBeenCalledTimes(1);
      expect(repository.bookSeats).toHaveBeenCalledWith([
        { filmId: FILM_ID, sessionId: SESSION_ID, seat: '2:3' },
        { filmId: FILM_ID, sessionId: SESSION_ID, seat: '2:4' },
      ]);
    });

    it('отвечает 404, если фильма нет в базе', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        controller.createOrder(createOrder([createTicket()])),
      ).rejects.toThrow(NotFoundException);
      expect(repository.bookSeats).not.toHaveBeenCalled();
    });

    it('отвечает 404, если у фильма нет такого сеанса', async () => {
      await expect(
        controller.createOrder(
          createOrder([createTicket({ session: MISSING_SESSION_ID })]),
        ),
      ).rejects.toThrow(NotFoundException);
      expect(repository.bookSeats).not.toHaveBeenCalled();
    });

    it('отвечает 400, если места нет в зале', async () => {
      await expect(
        controller.createOrder(createOrder([createTicket({ row: 99 })])),
      ).rejects.toThrow(BadRequestException);
      expect(repository.bookSeats).not.toHaveBeenCalled();
    });

    it('отвечает 400, если место уже занято', async () => {
      await expect(
        controller.createOrder(
          createOrder([createTicket({ row: 1, seat: 1 })]),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(repository.bookSeats).not.toHaveBeenCalled();
    });

    it('отвечает 400, если место заняли во время оформления заказа', async () => {
      repository.bookSeats.mockResolvedValue('2:3');

      await expect(
        controller.createOrder(createOrder([createTicket()])),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
