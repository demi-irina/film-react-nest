import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { GetFilmsDto, GetScheduleDto } from './dto/films.dto';
import {
  FILMS_REPOSITORY,
  FilmsRepository,
} from '../repository/films.repository';

@Injectable()
export class FilmsService {
  constructor(
    @Inject(FILMS_REPOSITORY) private readonly filmsRepository: FilmsRepository,
  ) {}

  async findAll(): Promise<GetFilmsDto> {
    const films = await this.filmsRepository.findAll();
    return { total: films.length, items: films };
  }

  async findScheduleById(id: string): Promise<GetScheduleDto> {
    const film = await this.filmsRepository.findById(id);
    if (!film) {
      throw new NotFoundException({ error: `Фильм ${id} не найден` });
    }
    return { total: film.schedule.length, items: film.schedule };
  }
}
