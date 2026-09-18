import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const configProvider = {
  provide: 'CONFIG',
  inject: [ConfigService],
  useFactory: (config: ConfigService): AppConfig => ({
    port: Number(config.get('PORT')) || 3000,
    logger: config.get('LOGGER') || 'dev',
    database: {
      driver: config.get('DATABASE_DRIVER'),
      url: config.get('DATABASE_URL'),
    },
  }),
};

export interface AppConfig {
  port: number;
  logger: string;
  database: AppConfigDatabase;
}

export interface AppConfigDatabase {
  driver: string;
  url: string;
}

@Global()
@Module({
  providers: [configProvider],
  exports: ['CONFIG'],
})
export class AppConfigModule {}
