import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { FilmDto, FilmWithScheduleDto } from '../../films/dto/films.dto';
import { Film, FilmDocument } from '../../films/films.schema';
import { toFilmDto, toFilmWithScheduleDto } from './films.mongo.converter';
import { FilmsRepository, SeatBooking } from '../films.repository';

@Injectable()
export class MongoFilmsRepository implements FilmsRepository {
  constructor(
    @InjectModel(Film.name) private readonly filmModel: Model<FilmDocument>,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmModel.find().lean<Film[]>().exec();
    return films.map(toFilmDto);
  }

  async findById(id: string): Promise<FilmWithScheduleDto | null> {
    const film = await this.filmModel.findOne({ id }).lean<Film>().exec();
    return film ? toFilmWithScheduleDto(film) : null;
  }

  async bookSeats(bookings: SeatBooking[]): Promise<string | null> {
    const booked: SeatBooking[] = [];

    try {
      for (const booking of bookings) {
        const isBooked = await this.addTakenSeat(booking);

        if (!isBooked) {
          await this.releaseSeats(booked);
          return booking.seat;
        }

        booked.push(booking);
      }
    } catch (error) {
      await this.releaseSeats(booked);
      throw error;
    }

    return null;
  }

  private async addTakenSeat({
    filmId,
    sessionId,
    seat,
  }: SeatBooking): Promise<boolean> {
    const result = await this.filmModel
      .updateOne(
        {
          id: filmId,
          schedule: { $elemMatch: { id: sessionId, taken: { $ne: seat } } },
        },
        { $addToSet: { 'schedule.$.taken': seat } },
      )
      .exec();

    return result.modifiedCount > 0;
  }

  private async removeTakenSeat({
    filmId,
    sessionId,
    seat,
  }: SeatBooking): Promise<void> {
    await this.filmModel
      .updateOne(
        { id: filmId, schedule: { $elemMatch: { id: sessionId } } },
        { $pull: { 'schedule.$.taken': seat } },
      )
      .exec();
  }

  private async releaseSeats(bookings: SeatBooking[]): Promise<void> {
    for (const booking of bookings) {
      try {
        await this.removeTakenSeat(booking);
      } catch {
        // Откат выполняется по мере возможности
      }
    }
  }
}
