import { FilmDto, FilmWithScheduleDto } from '../films/dto/films.dto';

export const FILMS_REPOSITORY = 'FILMS_REPOSITORY';

export interface FilmsRepository {
  findAll(): Promise<FilmDto[]>;
  findById(id: string): Promise<FilmWithScheduleDto | null>;
  addTakenSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<boolean>;
}
