# API

Все JSON endpoint, кроме публичных auth/health, требуют cookie-сессию. Тела изменений валидируются Zod. В примерах `expectedVersion` защищает от потерянного обновления.

## Авторизация

- `POST /api/auth/login` — `{ email, password }`, устанавливает HttpOnly cookie;
- `POST /api/auth/register` — регистрирует Client и компанию;
- `GET /api/auth/me` — текущий пользователь;
- `POST /api/auth/logout` — отзывает сессию.

## Заявки

- `GET /api/requests?q=&status=&priority=&customerId=&assigneeId=&sort=&page=&pageSize=`;
- `POST /api/requests` — создание;
- `GET /api/requests/:id` — агрегат с комментариями и timeline;
- `PATCH /api/requests/:id` — поля заявки + `expectedVersion`;
- `POST /api/requests/:id/transition` — `{ to, reason?, resolution?, expectedVersion }`;
- `POST /api/requests/:id/undo` — отмена последнего перехода новой записью истории;
- `POST /api/requests/:id/comments` — `{ body }`;
- `GET|POST /api/requests/:id/attachments` — список/multipart (`files`);
- `GET /api/attachments/:id` — авторизованное скачивание.

Файл: максимум 5 МБ, не более пяти на заявку; MIME — JPEG, PNG, PDF или plain text. Сервер проверяет доступ к родительской заявке и отдаёт `nosniff` + безопасный `Content-Disposition`.

## Уведомления

- `GET /api/notifications` — события пользователя и дедуплицированные SLA-предупреждения;
- `PATCH /api/notifications/read` — `{ id? }`; без `id` помечает прочитанными все.

## Администрирование

Только роль Admin:

- `GET /api/admin/analytics`;
- `GET /api/admin/users`, `PATCH /api/admin/users/:id`;
- `GET|POST /api/admin/categories`, `PATCH /api/admin/categories/:id`;
- `GET /api/admin/sla`, `PUT /api/admin/sla/:priority`.

## Коды ошибок

`401` — нет сессии; `403` — недостаточно прав/чужой tenant; `404` — сущность не найдена; `409` — конфликт версии или бизнес-перехода; `413/415` — размер/тип файла; `422` — невалидные данные; `429` — ограничение частоты; `503` — production не готов.
