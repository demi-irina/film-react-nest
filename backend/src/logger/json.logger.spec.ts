import { JsonLogger } from './json.logger';

const NOW = '2026-09-19T12:30:00.000Z';

describe('JsonLogger', () => {
  let logger: JsonLogger;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(NOW));
    logger = new JsonLogger();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('formatMessage', () => {
    it('складывает время, уровень, контекст и сообщение в JSON-объект', () => {
      const formatted = logger.formatMessage(
        'log',
        'Фильм найден',
        'FilmsService',
      );

      expect(JSON.parse(formatted)).toEqual({
        time: NOW,
        level: 'log',
        context: 'FilmsService',
        message: 'Фильм найден',
        optionalParams: [],
      });
    });

    it('не добавляет поле context, если контекст не передали', () => {
      const formatted = logger.formatMessage('warn', 'Сообщение без контекста');

      expect(JSON.parse(formatted)).toEqual({
        time: NOW,
        level: 'warn',
        message: 'Сообщение без контекста',
        optionalParams: [],
      });
      expect(Object.keys(JSON.parse(formatted))).not.toContain('context');
    });

    it('считает контекстом только последний строковый аргумент', () => {
      const formatted = logger.formatMessage(
        'debug',
        { filmId: 42 },
        { rows: 5 },
        'OrderService',
      );

      expect(JSON.parse(formatted)).toEqual({
        time: NOW,
        level: 'debug',
        context: 'OrderService',
        message: { filmId: 42 },
        optionalParams: [{ rows: 5 }],
      });
    });

    it('оставляет параметры как есть, если последний из них не строка', () => {
      const formatted = logger.formatMessage(
        'log',
        'Заказ создан',
        'OrderService',
        3,
      );

      expect(JSON.parse(formatted)).toEqual({
        time: NOW,
        level: 'log',
        message: 'Заказ создан',
        optionalParams: ['OrderService', 3],
      });
    });

    it('экранирует переводы строк и кавычки, оставляя запись однострочной', () => {
      const formatted = logger.formatMessage('error', 'Ошибка "БД"\nповтор');

      expect(formatted).not.toContain('\n');
      expect(JSON.parse(formatted).message).toBe('Ошибка "БД"\nповтор');
    });
  });

  describe('методы логирования', () => {
    it.each([
      ['log', 'log', 'log'],
      ['error', 'error', 'error'],
      ['warn', 'warn', 'warn'],
      ['debug', 'debug', 'debug'],
      ['verbose', 'log', 'verbose'],
      ['fatal', 'error', 'fatal'],
    ] as const)(
      'метод %s пишет в console.%s запись с уровнем %s',
      (method, consoleMethod, level) => {
        const spy = jest
          .spyOn(console, consoleMethod)
          .mockImplementation(() => undefined);

        logger[method]('Сообщение', 'AppModule');

        expect(spy).toHaveBeenCalledTimes(1);
        expect(JSON.parse(spy.mock.calls[0][0] as string)).toEqual({
          time: NOW,
          level,
          context: 'AppModule',
          message: 'Сообщение',
          optionalParams: [],
        });
      },
    );
  });
});
