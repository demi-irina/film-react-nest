import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

export const configProvider = {
  imports: [ConfigModule.forRoot()],
  provide: 'CONFIG',
  useValue: <AppConfig>{
    port: Number(process.env.PORT) || 3000,
    database: {
      driver: process.env.DATABASE_DRIVER,
      url: process.env.DATABASE_URL,
    },
  },
};

export interface AppConfig {
  port: number;
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
