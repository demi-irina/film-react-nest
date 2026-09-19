import { TskvLogger } from './tskv.logger';

const NOW = '2026-09-19T12:30:00.000Z';
const HEAD = `time=${NOW}`;

describe('TskvLogger', () => {
  let logger: TskvLogger;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(NOW));
    logger = new TskvLogger();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('formatMessage', () => {
    it('разделяет поля табуляцией, а ключ и значение — знаком равенства', () => {
      const formatted = logger.formatMessage('log', 'Фильм найден');

      expect(formatted).toBe(`${HEAD}\tlevel=log\tmessage=Фильм найден`);
    });

    it('открывает запись отметкой времени в формате ISO 8601', () => {
      const formatted = logger.formatMessage('log', 'Фильм найден');

      expect(formatted.split('\t')[0]).toBe(`time=${NOW}`);
    });

    it('выносит контекст Nest в отдельную колонку', () => {
      const formatted = logger.formatMessage(
        'log',
        'Заказ создан',
        'OrderService',
      );

      expect(formatted).toBe(
        `${HEAD}\tlevel=log\tcontext=OrderService\tmessage=Заказ создан`,
      );
    });

    it('не выводит колонку context, если контекст не передали', () => {
      const formatted = logger.formatMessage('log', 'Фильм найден');

      expect(formatted).not.toContain('context=');
    });

    it('нумерует параметры, если последний из них не строка', () => {
      const formatted = logger.formatMessage(
        'log',
        'Заказ создан',
        'OrderService',
        3,
      );

      expect(formatted).toBe(
        `${HEAD}\tlevel=log\tmessage=Заказ создан\tparam0=OrderService\tparam1=3`,
      );
    });

    it('не добавляет перевод строки внутрь записи', () => {
      const formatted = logger.formatMessage(
        'log',
        'Первая строка\nвторая строка',
      );

      expect(formatted.split('\n')).toHaveLength(1);
    });

    it('экранирует служебные символы формата', () => {
      const formatted = logger.formatMessage('warn', 'a\tb\nc\\d=e');

      expect(formatted).toBe(`${HEAD}\tlevel=warn\tmessage=a\\tb\\nc\\\\d=e`);
    });

    it('приводит объекты к плоской строке в формате JSON', () => {
      const formatted = logger.formatMessage('debug', { filmId: 42 });

      expect(formatted).toBe(`${HEAD}\tlevel=debug\tmessage={"filmId":42}`);
    });

    it('заменяет пустое значение на пустую строку', () => {
      const formatted = logger.formatMessage('log', undefined, null);

      expect(formatted).toBe(`${HEAD}\tlevel=log\tmessage=\tparam0=`);
    });

    it('пишет стек ошибки как значение параметра', () => {
      const error = new Error('Место занято');
      error.stack = 'Error: Место занято\n    at OrderService';

      const formatted = logger.formatMessage('error', 'Заказ отклонён', error);

      expect(formatted).toBe(
        `${HEAD}\tlevel=error\tmessage=Заказ отклонён\tparam0=Error: Место занято\\n    at OrderService`,
      );
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
        expect(spy).toHaveBeenCalledWith(
          `${HEAD}\tlevel=${level}\tcontext=AppModule\tmessage=Сообщение`,
        );
      },
    );
  });
});
