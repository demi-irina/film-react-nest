# FILM! — фронтенд

SPA афиши кинотеатра на React. Показывает фильмы и позволяет выбрать сеанс, места и оформить заказ.

## Стек

React, TypeScript, Vite, SCSS Modules, Storybook.

## Настройка

```bash
npm ci
cp .env.example .env
```

Переменные окружения:

| Переменная     | Значение                                                       |
|----------------|----------------------------------------------------------------|
| `VITE_API_URL` | Адрес API, например `http://localhost:3000/api/afisha`         |
| `VITE_CDN_URL` | Адрес статики, например `http://localhost:3000/content/afisha` |

Используются только при локальном запуске через dev-сервер Vite. В production-сборке используются относительные пути
`/api/afisha` и `/content/afisha`, которые nginx проксирует на бэкенд.

## Команды

| Команда                   | Назначение                   |
|---------------------------|------------------------------|
| `npm run dev`             | Запустить режим разработки   |
| `npm run build`           | Собрать приложение           |
| `npm run preview`         | Открыть собранное приложение |
| `npm run storybook`       | Запустить Storybook          |
| `npm run build-storybook` | Собрать Storybook            |
| `npm run component`       | Создать компонент из шаблона |
| `npm run lint`            | Проверить код линтером       |
| `npm run lint:fix`        | Исправить ошибки линтера     |
