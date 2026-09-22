import { LogLevel, LoggerService } from '@nestjs/common';

export interface LogRecord {
  time: string;
  level: LogLevel;
  context?: string;
  message: unknown;
  optionalParams: unknown[];
}

const CONSOLE_METHOD: Record<LogLevel, 'log' | 'error' | 'warn' | 'debug'> = {
  log: 'log',
  error: 'error',
  warn: 'warn',
  debug: 'debug',
  verbose: 'log',
  fatal: 'error',
};

export abstract class StructuredLogger implements LoggerService {
  protected abstract format(record: LogRecord): string;

  formatMessage(
    level: LogLevel,
    message: unknown,
    ...optionalParams: unknown[]
  ): string {
    return this.format(this.createRecord(level, message, optionalParams));
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.write('log', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.write('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.write('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.write('verbose', message, optionalParams);
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.write('fatal', message, optionalParams);
  }

  private write(
    level: LogLevel,
    message: unknown,
    optionalParams: unknown[],
  ): void {
    console[CONSOLE_METHOD[level]](
      this.formatMessage(level, message, ...optionalParams),
    );
  }

  private createRecord(
    level: LogLevel,
    message: unknown,
    optionalParams: unknown[],
  ): LogRecord {
    const args = [message, ...optionalParams];
    const last = args[args.length - 1];
    const hasContext = args.length > 1 && typeof last === 'string';
    const [head, ...rest] = hasContext ? args.slice(0, -1) : args;

    return {
      time: new Date().toISOString(),
      level,
      context: hasContext ? (last as string) : undefined,
      message: head,
      optionalParams: rest,
    };
  }
}
