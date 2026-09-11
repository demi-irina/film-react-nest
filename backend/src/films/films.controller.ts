import { Controller, Get, Param } from '@nestjs/common';

import { GetFilmsDto, GetScheduleDto } from './dto/films.dto';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async getFilms(): Promise<GetFilmsDto> {
    return this.filmsService.findAll();
  }

  @Get(':id/schedule')
  async getFilmSchedule(@Param('id') id: string): Promise<GetScheduleDto> {
    return this.filmsService.findScheduleById(id);
  }
}
