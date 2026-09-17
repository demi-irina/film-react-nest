import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Film } from './film.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  daytime: string;

  @Column('int')
  hall: number;

  @Column('int')
  rows: number;

  @Column('int')
  seats: number;

  @Column('float')
  price: number;

  @Column('text', { array: true })
  taken: string[];

  @ManyToOne(() => Film, (film) => film.schedule)
  film: Film;
}
