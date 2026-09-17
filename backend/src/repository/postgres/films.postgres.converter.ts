import {
  FilmDto,
  FilmWithScheduleDto,
  ScheduleDto,
} from '../../films/dto/films.dto';
import { Film } from '../../films/entities/film.entity';
import { Schedule } from '../../films/entities/schedule.entity';

export function toScheduleDto(schedule: Schedule): ScheduleDto {
  return {
    id: schedule.id,
    daytime: schedule.daytime,
    hall: schedule.hall,
    rows: schedule.rows,
    seats: schedule.seats,
    price: schedule.price,
    taken: schedule.taken,
  };
}

export function toFilmDto(film: Film): FilmDto {
  return {
    id: film.id,
    rating: film.rating,
    director: film.director,
    tags: film.tags,
    title: film.title,
    about: film.about,
    description: film.description,
    image: film.image,
    cover: film.cover,
  };
}

export function toFilmWithScheduleDto(film: Film): FilmWithScheduleDto {
  return {
    ...toFilmDto(film),
    schedule: (film.schedule ?? []).map(toScheduleDto),
  };
}
