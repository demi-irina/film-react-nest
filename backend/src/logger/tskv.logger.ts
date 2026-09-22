import { Injectable } from '@nestjs/common';

import { LogRecord, StructuredLogger } from './structured.logger';

type TskvField = [key: string, value: unknown];

@Injectable()
export class TskvLogger extends StructuredLogger {
  protected format(record: LogRecord): string {
    const { time, level, context, message, optionalParams } = record;

    const fields: TskvField[] = [
      ['time', time],
      ['level', level],
      ...(context === undefined ? [] : ([['context', context]] as TskvField[])),
      ['message', message],
      ...optionalParams.map(
        (param, index): TskvField => [`param${index}`, param],
      ),
    ];

    return fields
      .map(([key, value]) => `${key}=${TskvLogger.escape(value)}`)
      .join('\t');
  }

  private static escape(value: unknown): string {
    return TskvLogger.stringify(value)
      .replace(/\\/g, '\\\\')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n');
  }

  private static stringify(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Error) {
      return value.stack ?? `${value.name}: ${value.message}`;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }
}
