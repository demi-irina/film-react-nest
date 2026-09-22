# FILM!

Афиша кинотеатра с выбором сеансов, мест и оформлением заказа.

Приложение доступно по адресу: http://film-project.nomorepartiessite.ru

## Стек

- Фронтенд: React, TypeScript, Vite
- Бэкенд: NestJS, TypeScript
- Инфраструктура: Docker Compose, nginx

## Запуск в Docker

```bash
cp .env.example .env
docker compose up -d --build
```

После запуска доступны:

- приложение: http://localhost
- pgAdmin: http://localhost:8080

Переменные окружения:

| Переменная                 | Значение                                          |
|----------------------------|---------------------------------------------------|
| `POSTGRES_USER`            | Пользователь PostgreSQL                           |
| `POSTGRES_PASSWORD`        | Пароль пользователя PostgreSQL                    |
| `POSTGRES_DB`              | Название базы данных                              |
| `DATABASE_DRIVER`          | Драйвер базы данных, для Docker только `postgres` |
| `LOGGER`                   | Формат логов: `dev`, `json` или `tskv`            |
| `PGADMIN_DEFAULT_EMAIL`    | Адрес электронной почты для входа в pgAdmin       |
| `PGADMIN_DEFAULT_PASSWORD` | Пароль для входа в pgAdmin                        |

## Наполнение базы данных

```bash
docker compose exec -T database psql -U prac -d prac < backend/test/prac.init.sql
docker compose exec -T database psql -U prac -d prac < backend/test/prac.films.sql
docker compose exec -T database psql -U prac -d prac < backend/test/prac.schedules.sql
```

## Локальная разработка

Бэкенд и фронтенд запускаются отдельно. Подробные команды и переменные окружения описаны в их README:

- [Документация бэкенда](backend/README.md)
- [Документация фронтенда](frontend/README.md)

## Деплой

При пуше в `main` GitHub Actions собирает и публикует Docker-образы в GHCR.
Если настроены `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH` и `DEPLOY_SSH_KEY`, приложение также автоматически
обновляется на сервере.

Для ручного обновления:

```bash
docker compose pull
docker compose up -d
docker compose ps
```
