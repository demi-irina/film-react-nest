import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppConfig, AppConfigModule } from '../../app.config.provider';
import { Film, FilmSchema } from '../../films/films.schema';
import { FILMS_REPOSITORY } from '../films.repository';
import { MongoFilmsRepository } from './films.mongo.repository';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: ['CONFIG'],
      useFactory: (config: AppConfig) => ({ uri: config.database.url }),
    }),
    MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]),
  ],
  providers: [{ provide: FILMS_REPOSITORY, useClass: MongoFilmsRepository }],
  exports: [FILMS_REPOSITORY],
})
export class MongoRepositoryModule {}
