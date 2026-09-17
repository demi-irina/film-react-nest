import { DynamicModule, Module, Type } from '@nestjs/common';

import { MongoRepositoryModule } from './mongodb/mongo.repository.module';
import { PostgresRepositoryModule } from './postgres/postgres.repository.module';

const DRIVERS: Record<string, Type> = {
  mongodb: MongoRepositoryModule,
  postgres: PostgresRepositoryModule,
};

@Module({})
export class RepositoryModule {
  static forRoot(): DynamicModule {
    const driver = process.env.DATABASE_DRIVER;
    const module = DRIVERS[driver];

    if (!module) {
      throw new Error(`Неизвестный DATABASE_DRIVER: ${driver}`);
    }

    return {
      module: RepositoryModule,
      global: true,
      imports: [module],
      exports: [module],
    };
  }
}
