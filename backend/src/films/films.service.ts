import { Injectable } from '@nestjs/common';

import { GetFilmsDto, GetScheduleDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  async findAll(): Promise<GetFilmsDto> {
    return { total: 0, items: [] };
  }

  async findScheduleById(id: string): Promise<GetScheduleDto> {
    void id;
    return { total: 0, items: [] };
  }
}
