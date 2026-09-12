import { ListDto } from '../../dto/list.dto';

export class ScheduleDto {
  id: string;
  daytime: string;
  hall: number;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export class FilmDto {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  title: string;
  about: string;
  description: string;
  image: string;
  cover: string;
}

export class GetFilmsDto extends ListDto<FilmDto> {}

export class GetScheduleDto extends ListDto<ScheduleDto> {}

export class FilmWithScheduleDto extends FilmDto {
  schedule: ScheduleDto[];
}
