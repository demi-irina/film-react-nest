import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'uniqueSeats' })
export class UniqueSeatsConstraint implements ValidatorConstraintInterface {
  validate(tickets: unknown): boolean {
    if (!Array.isArray(tickets)) {
      return true;
    }

    const places = tickets.map(
      (ticket) =>
        `${ticket?.film}:${ticket?.session}:${ticket?.row}:${ticket?.seat}`,
    );

    return new Set(places).size === places.length;
  }

  defaultMessage(): string {
    return 'Одно и то же место указано в заказе дважды';
  }
}
