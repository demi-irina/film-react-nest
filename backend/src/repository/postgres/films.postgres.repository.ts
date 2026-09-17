import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FilmDto, FilmWithScheduleDto } from '../../films/dto/films.dto';
import { Film } from '../../films/entities/film.entity';
import { Schedule } from '../../films/entities/schedule.entity';
import { FilmsRepository } from '../films.repository';
import { toFilmDto, toFilmWithScheduleDto } from './films.postgres.converter';

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

  async addTakenSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<boolean> {
    const result = await this.scheduleRepository
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

  async removeTakenSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<void> {
    await this.scheduleRepository
      .createQueryBuilder()
      .update(Schedule)
      .set({ taken: () => `array_remove(taken, :seat)` })
      .where('id = :sessionId')
      .andWhere('"filmId" = :filmId')
      .setParameters({ seat, sessionId, filmId })
      .execute();
  }
}
