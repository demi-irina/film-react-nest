import {
  FilmDto,
  FilmWithScheduleDto,
  ScheduleDto,
} from '../../films/dto/films.dto';
import { Film } from '../../films/entities/film.entity';
import { Schedule } from '../../films/entities/schedule.entity';

function split(value: string): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function toScheduleDto(schedule: Schedule): ScheduleDto {
  return {
    id: schedule.id,
    daytime: schedule.daytime,
    hall: schedule.hall,
    rows: schedule.rows,
    seats: schedule.seats,
    price: schedule.price,
    taken: split(schedule.taken),
  };
}

export function toFilmDto(film: Film): FilmDto {
  return {
    id: film.id,
    rating: film.rating,
    director: film.director,
    tags: split(film.tags),
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
