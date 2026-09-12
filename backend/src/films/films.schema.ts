import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false, versionKey: false })
export class Schedule {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  daytime: string;

  @Prop({ type: Number, required: true })
  hall: number;

  @Prop({ type: Number, required: true })
  rows: number;

  @Prop({ type: Number, required: true })
  seats: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: [String], default: [] })
  taken: string[];
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

@Schema({ collection: 'films', versionKey: false })
export class Film {
  @Prop({ type: String, required: true, index: true })
  id: string;

  @Prop({ type: Number, default: 0 })
  rating: number;

  @Prop({ type: String })
  director: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  about: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  image: string;

  @Prop({ type: String })
  cover: string;

  @Prop({ type: [ScheduleSchema], default: [] })
  schedule: Schedule[];
}

export type FilmDocument = HydratedDocument<Film>;

export const FilmSchema = SchemaFactory.createForClass(Film);
