import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfig, AppConfigModule } from '../../app.config.provider';
import { Film } from '../../films/entities/film.entity';
import { Schedule } from '../../films/entities/schedule.entity';
import { FILMS_REPOSITORY } from '../films.repository';
import { PostgresFilmsRepository } from './films.postgres.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: ['CONFIG'],
      useFactory: (config: AppConfig) => ({
        type: 'postgres' as const,
        url: config.database.url,
        entities: [Film, Schedule],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([Film, Schedule]),
  ],
  providers: [{ provide: FILMS_REPOSITORY, useClass: PostgresFilmsRepository }],
  exports: [FILMS_REPOSITORY],
})
export class PostgresRepositoryModule {}
