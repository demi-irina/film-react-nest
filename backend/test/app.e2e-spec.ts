import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/afisha');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const order = (tickets: unknown[]) => ({
    email: 'test@test.ru',
    phone: '+7 (999) 999-99-99',
    tickets,
  });

  it('GET /api/afisha/films отвечает 200 и возвращает список фильмов', () => {
    return request(app.getHttpServer())
      .get('/api/afisha/films')
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body.items)).toBe(true);
        expect(body.total).toBe(body.items.length);
      });
  });

  it('GET /api/afisha/films/:id/schedule отвечает 404 на неизвестный фильм', () => {
    return request(app.getHttpServer())
      .get('/api/afisha/films/unknown-id/schedule')
      .expect(404);
  });

  it('POST /api/afisha/order отвечает 400 на пустой список билетов', () => {
    return request(app.getHttpServer())
      .post('/api/afisha/order')
      .send(order([]))
      .expect(400);
  });

  it('POST /api/afisha/order отвечает 400 на билет без фильма и сеанса', () => {
    return request(app.getHttpServer())
      .post('/api/afisha/order')
      .send(order([{ row: 1, seat: 1, price: 350 }]))
      .expect(400);
  });

  it('POST /api/afisha/order отвечает 404 на неизвестный фильм', () => {
    return request(app.getHttpServer())
      .post('/api/afisha/order')
      .send(
        order([
          {
            film: 'unknown-film',
            session: 'unknown-session',
            row: 1,
            seat: 1,
            price: 350,
          },
        ]),
      )
      .expect(404);
  });
});
