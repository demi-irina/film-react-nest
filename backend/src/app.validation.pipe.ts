import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

function collectMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...collectMessages(error.children ?? []),
  ]);
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({ error: collectMessages(errors).join('; ') }),
  });
}
