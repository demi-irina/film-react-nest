import { Global, LoggerService, Module, Type } from '@nestjs/common';

import { AppConfig } from '../app.config.provider';
import { DevLogger } from './dev.logger';
import { JsonLogger } from './json.logger';
import { TskvLogger } from './tskv.logger';

export const LOGGER = 'LOGGER';

const LOGGERS: Record<string, Type<LoggerService>> = {
  dev: DevLogger,
  json: JsonLogger,
  tskv: TskvLogger,
};

export const loggerProvider = {
  provide: LOGGER,
  inject: ['CONFIG'],
  useFactory: (config: AppConfig): LoggerService => {
    const Logger = LOGGERS[config.logger];

    if (!Logger) {
      throw new Error(`Неизвестный LOGGER: ${config.logger}`);
    }

    return new Logger();
  },
};

@Global()
@Module({
  providers: [loggerProvider],
  exports: [LOGGER],
})
export class LoggerModule {}
