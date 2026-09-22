import { Test, TestingModule } from '@nestjs/testing';

import { AppConfig } from '../app.config.provider';
import { DevLogger } from './dev.logger';
import { JsonLogger } from './json.logger';
import { LOGGER, loggerProvider } from './logger.module';
import { TskvLogger } from './tskv.logger';

const createConfig = (logger: string): AppConfig => ({
  port: 3000,
  logger,
  database: {
    driver: 'postgres',
    url: 'postgres://prac:prac@localhost:5432/prac',
  },
});

const compileWith = (logger: string): Promise<TestingModule> =>
  Test.createTestingModule({
    providers: [
      { provide: 'CONFIG', useValue: createConfig(logger) },
      loggerProvider,
    ],
  }).compile();

describe('loggerProvider', () => {
  describe('выбор реализации по значению LOGGER', () => {
    it.each([
      { value: 'dev', expected: DevLogger, name: 'DevLogger' },
      { value: 'json', expected: JsonLogger, name: 'JsonLogger' },
      { value: 'tskv', expected: TskvLogger, name: 'TskvLogger' },
    ])('при LOGGER=$value подключает $name', async ({ value, expected }) => {
      const module = await compileWith(value);

      expect(module.get(LOGGER)).toBeInstanceOf(expected);

      await module.close();
    });

    it('сообщает о неизвестном значении и не поднимает приложение', async () => {
      await expect(compileWith('xml')).rejects.toThrow(
        'Неизвестный LOGGER: xml',
      );
    });
  });
});
