import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as path from 'node:path';

import { AppConfig, AppConfigModule } from './app.config.provider';
import { createValidationPipe } from './app.validation.pipe';
import { FilmsModule } from './films/films.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: ['CONFIG'],
      useFactory: (config: AppConfig) => ({ uri: config.database.url }),
    }),
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
