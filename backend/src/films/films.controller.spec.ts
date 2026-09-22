import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmDto, FilmWithScheduleDto, ScheduleDto } from './dto/films.dto';
import {
  FILMS_REPOSITORY,
  FilmsRepository,
} from '../repository/films.repository';

const FILM_ID = '11111111-1111-1111-1111-111111111111';
const SESSION_ID = '22222222-2222-2222-2222-222222222222';
const MISSING_FILM_ID = '00000000-0000-0000-0000-000000000000';

const schedule: ScheduleDto = {
  id: SESSION_ID,
  daytime: '2026-01-01T10:00:00.000Z',
  hall: 1,
  rows: 5,
  seats: 10,
  price: 350,
  taken: ['1:1'],
};

const filmWithoutSchedule: FilmDto = {
  id: FILM_ID,
  rating: 2.9,
  director: 'Итан Райт',
  tags: ['Драма'],
  title: 'Архитекторы общества',
  about: 'Документальный фильм',
  description: 'Документальный фильм Итана Райта',
  image: '/bg1s.jpg',
  cover: '/bg1c.jpg',
};

const film: FilmWithScheduleDto = {
  ...filmWithoutSchedule,
  schedule: [schedule],
};

describe('FilmsController', () => {
  let controller: FilmsController;
  let repository: jest.Mocked<FilmsRepository>;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      bookSeats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        FilmsService,
        { provide: FILMS_REPOSITORY, useValue: repository },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
  });

  describe('GET /films', () => {
    it('возвращает список фильмов и их количество', async () => {
      repository.findAll.mockResolvedValue([filmWithoutSchedule]);

      await expect(controller.getFilms()).resolves.toEqual({
        total: 1,
        items: [filmWithoutSchedule],
      });
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('возвращает пустую афишу, если фильмов нет', async () => {
      repository.findAll.mockResolvedValue([]);

      await expect(controller.getFilms()).resolves.toEqual({
        total: 0,
        items: [],
      });
    });
  });

  describe('GET /films/:id/schedule', () => {
    it('возвращает расписание запрошенного фильма', async () => {
      repository.findById.mockResolvedValue(film);

      await expect(controller.getFilmSchedule(film.id)).resolves.toEqual({
        total: 1,
        items: [schedule],
      });
      expect(repository.findById).toHaveBeenCalledWith(film.id);
    });

    it('отвечает 404, если фильма нет в базе', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(controller.getFilmSchedule(MISSING_FILM_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
