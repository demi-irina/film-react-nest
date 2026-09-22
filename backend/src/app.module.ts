import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import * as path from 'node:path';

import { AppConfigModule } from './app.config.provider';
import { createValidationPipe } from './app.validation.pipe';
import { FilmsModule } from './films/films.module';
import { LoggerModule } from './logger/logger.module';
import { OrderModule } from './order/order.module';
import { RepositoryModule } from './repository/repository.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    AppConfigModule,
    LoggerModule,
    RepositoryModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api/afisha/(.*)'],
    }),
    FilmsModule,
    OrderModule,
  ],
  controllers: [],
  providers: [{ provide: APP_PIPE, useFactory: createValidationPipe }],
})
export class AppModule {}
