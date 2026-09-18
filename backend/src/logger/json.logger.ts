import { Injectable } from '@nestjs/common';

import { LogRecord, StructuredLogger } from './structured.logger';

@Injectable()
export class JsonLogger extends StructuredLogger {
  protected format(record: LogRecord): string {
    return JSON.stringify(record);
  }
}
