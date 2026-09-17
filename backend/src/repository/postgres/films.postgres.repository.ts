import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { FilmDto, FilmWithScheduleDto } from '../../films/dto/films.dto';
import { Film } from '../../films/entities/film.entity';
import { Schedule } from '../../films/entities/schedule.entity';
import { FilmsRepository, SeatBooking } from '../films.repository';
import { toFilmDto, toFilmWithScheduleDto } from './films.postgres.converter';

class SeatTakenError extends Error {
  constructor(readonly seat: string) {
    super();
  }
}

@Injectable()
export class PostgresFilmsRepository implements FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmRepository.find();
    return films.map(toFilmDto);
  }

  async findById(id: string): Promise<FilmWithScheduleDto | null> {
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: { schedule: true },
      order: { schedule: { daytime: 'ASC' } },
    });

    return film ? toFilmWithScheduleDto(film) : null;
  }

  async bookSeats(bookings: SeatBooking[]): Promise<string | null> {
    try {
      return await this.scheduleRepository.manager.transaction(
        async (manager) => {
          for (const booking of bookings) {
            const isBooked = await PostgresFilmsRepository.addTakenSeat(
              manager,
              booking,
            );

            if (!isBooked) {
              throw new SeatTakenError(booking.seat);
            }
          }

          return null;
        },
      );
    } catch (error) {
      if (error instanceof SeatTakenError) {
        return error.seat;
      }

      throw error;
    }
  }

  private static async addTakenSeat(
    manager: EntityManager,
    { filmId, sessionId, seat }: SeatBooking,
  ): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(Schedule)
      .set({ taken: () => `array_append(taken, :seat)` })
      .where('id = :sessionId')
      .andWhere('"filmId" = :filmId')
      .andWhere(`NOT (taken @> ARRAY[:seat])`)
      .setParameters({ seat, sessionId, filmId })
      .execute();

    return (result.affected ?? 0) > 0;
  }
}
