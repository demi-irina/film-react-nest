import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { FilmDto, FilmWithScheduleDto } from '../films/dto/films.dto';
import { Film, FilmDocument } from '../films/films.schema';
import { toFilmDto, toFilmWithScheduleDto } from './films.converter';
import { FilmsRepository } from './films.repository';

@Injectable()
export class MongoFilmsRepository implements FilmsRepository {
  constructor(
    @InjectModel(Film.name) private readonly filmModel: Model<FilmDocument>,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmModel.find().lean<Film[]>().exec();
    return films.map(toFilmDto);
  }

  async findById(id: string): Promise<FilmWithScheduleDto | null> {
    const film = await this.filmModel.findOne({ id }).lean<Film>().exec();
    return film ? toFilmWithScheduleDto(film) : null;
  }
}
