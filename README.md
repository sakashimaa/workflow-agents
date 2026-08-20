# WorkFlow Service Desk

Полноценный сервис-деск по ТЗ из `WorkFlow_TZ_9_levels_remote_assessment.pdf`: от адаптивного SSR-интерфейса до PostgreSQL, ролевой модели, SLA, вложений, аналитики, тестов и production-контейнеров.

## Возможности

- жизненный цикл заявок `new → assigned → in_progress → waiting/resolved → closed` с эскалацией, обязательными причинами и историей;
- роли Client, Operator, Agent и Admin с серверной изоляцией данных;
- поиск, фильтры, сортировка и пагинация в URL, SSR и защита от устаревших ответов;
- optimistic update, проверка версии, rollback и отмена последнего изменения;
- комментарии, защищённые вложения, уведомления и SLA;
- административные экраны пользователей, категорий, SLA и аналитики;
- публичная справка, SEO-метаданные, canonical, sitemap, robots, prerender и SWR;
- memory demo для быстрого старта и PostgreSQL для постоянного хранения.

Стек: Nuxt 4, Vue 3, TypeScript strict, Nitro, Pinia, Tailwind CSS, Zod, PostgreSQL, Drizzle schema/migrations, Vitest, Playwright, ESLint, Docker.

## Быстрый старт без БД

Нужны Node.js 22+ (CI и контейнер используют Node 24).

```bash
npm ci
npm run dev
```

Открыть `http://localhost:3000`. Без `NUXT_DATABASE_URL` приложение явно работает в непостоянном demo-режиме.

Демо-аккаунты, пароль для всех — `Demo1234!`:

| Роль | Email |
| --- | --- |
| Client | `client@workflow.local` |
| Operator | `operator@workflow.local` |
| Agent | `agent@workflow.local` |
| Admin | `admin@workflow.local` |

## Запуск с PostgreSQL

```bash
cp .env.example .env
npm run db:setup
npm run dev
```

`db:setup` последовательно применяет миграции из `drizzle/` и загружает детерминированные демо-данные. Миграции повторяемы, а применённые версии записываются в `schema_migrations`.

Основные переменные:

| Переменная | Назначение |
| --- | --- |
| `NUXT_DATABASE_URL` | PostgreSQL connection string |
| `NUXT_SESSION_SECRET` | секрет не короче 32 символов; обязателен в production |
| `NUXT_PUBLIC_SITE_URL` | публичный origin для canonical и sitemap |
| `SEED_DEMO_DATA` | загрузить демо-набор при старте контейнера |

## Docker Compose

```bash
docker compose up --build
```

Compose поднимает PostgreSQL 17, ждёт его health check, применяет миграции, по умолчанию загружает демо-набор и запускает приложение на `http://localhost:3000`. Данные БД и вложения находятся в именованных volumes. Для production задайте сильный `NUXT_SESSION_SECRET`, внешний `NUXT_PUBLIC_SITE_URL`, `SEED_DEMO_DATA=false` и секреты БД через платформу развёртывания.

Проверка готовности: `GET /api/health`. Production-инстанс без доступной PostgreSQL возвращает 503.

## Проверки

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm audit --omit=dev --audit-level=high
```

Unit-тесты проверяют переходы, права видимости, конфликт версий, нормализацию DTO и single-flight. Playwright покрывает авторизацию, основной workflow, race condition поиска, RBAC в обход UI, SSR/SEO, админские API, SLA и multipart-вложения. CI выполняет весь набор с настоящей PostgreSQL.

## Карта приложения

- публичные: `/`, `/login`, `/register`, `/faq`, `/help`, `/articles/**`;
- рабочие: `/dashboard`, `/requests`, `/requests/:id`, `/tasks`, `/customers`, `/notifications`, `/profile`;
- только Admin: `/admin`, `/admin/users`, `/admin/categories`, `/admin/sla`, `/admin/analytics`;
- API: `/api/auth/**`, `/api/requests/**`, `/api/attachments/**`, `/api/notifications/**`, `/api/admin/**`, `/api/health`.

HTTP-обработчики всегда повторно проверяют сессию и права: скрытая кнопка не является механизмом безопасности. Ошибки имеют осмысленные статусы 401/403/404/409/413/415/422/429/503.

## Документация

- [ARCHITECTURE.md](ARCHITECTURE.md) — границы модулей, диаграммы и ADR;
- [PERFORMANCE.md](PERFORMANCE.md) — бюджеты и воспроизводимый before/after замер;
- [TRADEOFFS.md](TRADEOFFS.md) — сознательные упрощения и план масштабирования;
- [docs/API.md](docs/API.md) — контракты основных endpoint;
- [docs/SECURITY.md](docs/SECURITY.md) — модель угроз и защитные меры;
- [docs/BUGS.md](docs/BUGS.md) — найденные регрессии и тесты, которые их фиксируют;
- [AI_USED.md](AI_USED.md) — прозрачное описание применения AI.

## История уровней

Каждый этап доступен через Git-теги `level-1` … `level-9`; итоговый релиз — `v1.0.0`. Реализация разбита на небольшие тематические коммиты, поэтому изменения можно ревьюить последовательно.
