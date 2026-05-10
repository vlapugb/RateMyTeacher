# StudRadar

Честная карта преподавателей математико-механического факультета СПбГУ. Студенты ставят оценки и пишут комментарии — вместо слухов из чатов получается прозрачный рейтинг.

## Возможности

- **Каталог преподавателей** (~340 преподавателей матмеха) с поиском, сортировкой по рейтингу и пагинацией
- **Оценки по 6 категориям:** знания, общение, халявность, справедливость оценивания, вайбовость, общая
- **Анонимные и авторизованные отзывы:** оценки требуют входа и подтверждённой почты, текстовые комментарии можно оставлять без регистрации
- **Избранное** — сохранение преподавателей для быстрого доступа
- **Лайки комментариев**
- **Лента комментариев** с сортировкой (новые, по рейтингу)
- **Личный кабинет** — статистика активности, смена пароля, настройки темы и языка
- **3 языка интерфейса:** русский, English, 中文
- **Тёмная/светлая/системная тема**
- **Proof-of-work защита** от ботов (Anubis)

## Стек

| Слой | Технологии |
|---|---|
| Фреймворк | Next.js 15 (App Router) + TypeScript strict |
| Стили | Tailwind CSS 4 + кастомные UI-компоненты |
| База данных | PostgreSQL 18 |
| ORM | Drizzle ORM + Drizzle Kit |
| Аутентификация | Better Auth (email/password) |
| Почта | Nodemailer (SMTP) / Gmail API / SendGrid / Brevo / Mailgun |
| Логирование | Pino |
| Валидация | Zod |
| Деплой | Docker Compose + Caddy (reverse proxy) + Anubis (PoW) |

## Быстрый старт

```bash
git clone <repo-url>
cd studradar
cp .env.example .env
# заполните .env своими значениями (см. секцию «Переменные окружения»)
npm install
npm run dev
```

Приложение будет доступно на `http://localhost:3000`.

## Переменные окружения

Скопируйте `.env.example` → `.env` и заполните:

| Переменная | Назначение | Пример |
|---|---|---|
| `DATABASE_URL` | Строка подключения к PostgreSQL | `postgresql://user:pass@localhost:5432/studradar` |
| `BETTER_AUTH_SECRET` | Секрет для JWT (минимум 32 символа) | `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Базовый URL приложения | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Публичный URL (для ссылок в письмах) | `http://localhost:3000` |
| `EMAIL_PROVIDER` | Способ отправки почты | `smtp`, `gmail`, `sendgrid`, `brevo`, `mailgun` |
| `EMAIL_FROM` | Обратный адрес писем | `"StudRadar <noreply@example.com>"` |
| `ANUBIS_ED25519_PRIVATE_KEY_HEX` | Ключ для Anubis PoW (64 hex-символа) | `openssl rand -hex 32` |

### Для Gmail API (рекомендуется, если VPS блокирует SMTP)

```bash
# Получить URL для OAuth
npm run gmail:auth-url

# Обменять код на refresh-токен
npm run gmail:exchange -- CODE_FROM_REDIRECT
```

Заполните в `.env`: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`.

### Для SMTP

Заполните в `.env`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`.

## Работа с базой данных

```bash
# Поднять PostgreSQL
docker compose up -d db

# Сгенерировать миграции
npm run db:generate

# Применить миграции
npm run db:migrate

# Открыть Drizzle Studio (GUI)
npm run db:studio
```

## Деплой на VPS

1. Заполните `.env` **продакшен-значениями**:
   - `BETTER_AUTH_SECRET` — минимум 32 символа, уникальный
   - `BETTER_AUTH_URL` — `https://ваш-домен`
   - `NEXT_PUBLIC_APP_URL` — `https://ваш-домен`
   - `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
   - `ANUBIS_ED25519_PRIVATE_KEY_HEX` — `openssl rand -hex 32`

2. Настройте домен в `deploy/Caddyfile`:
   ```
   ваш-домен.ru www.ваш-домен.ru {
       reverse_proxy anubis:8080
   }
   ```

3. Запустите:
   ```bash
   docker compose up -d --build
   ```

4. Проверьте:
   ```bash
   curl https://ваш-домен/api/health
   ```

## Команды npm

| Команда | Описание |
|---|---|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск production-сервера |
| `npm run lint` | ESLint |
| `npm run db:generate` | Генерация миграций Drizzle |
| `npm run db:migrate` | Применение миграций |
| `npm run db:studio` | Drizzle Studio (GUI для БД) |
| `npm run email:test` | Тестовая отправка письма |
| `npm run gmail:auth-url` | URL для OAuth авторизации Gmail |
| `npm run gmail:exchange` | Обмен OAuth-кода на refresh-токен |

## Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── auth/           # Better Auth handler
│   │   ├── reviews/        # CRUD отзывов + лайки
│   │   ├── teachers/       # Каталог преподавателей
│   │   ├── favorites/      # Избранное
│   │   ├── account/        # Сводка аккаунта
│   │   └── health/         # Healthcheck
│   ├── teachers/           # Страницы преподавателей
│   ├── account/            # Личный кабинет
│   ├── favorites/          # Избранное
│   ├── faq/                # FAQ
│   ├── about/              # О проекте
│   └── reset-password/     # Сброс пароля
├── components/             # React-компоненты
│   └── ui/                 # Базовые UI-компоненты (Button)
├── db/                     # Слой базы данных
│   ├── schema.ts           # Drizzle-схема
│   └── client.ts           # Подключение к PostgreSQL
└── lib/                    # Бизнес-логика
    ├── auth.ts             # Конфигурация Better Auth
    ├── auth-client.ts      # Клиент Better Auth
    ├── teacher-store.ts    # Хранилище отзывов и статистики
    ├── teacher-model.ts    # Модели Teacher и Review
    ├── email.ts            # Отправка писем
    ├── rate-limit.ts       # Rate limiting
    ├── env.ts              # Валидация переменных окружения
    ├── logger.ts           # Логирование (Pino)
    ├── student-identity.ts # Валидация студенческой почты/логина
    ├── mock-data.ts        # Данные преподавателей
    ├── i18n.ts             # Локализация
    ├── preferences.ts      # Настройки темы и языка (клиент)
    ├── local-ratings.ts    # Локальные оценки (localStorage)
    └── types.ts            # Общие типы
```

## Безопасность

- Пароли хешируются (Better Auth, bcrypt)
- Сессии в HTTP-only, SameSite=Lax cookies
- Все SQL-запросы параметризованы (Drizzle)
- Валидация ввода через Zod на сервере
- Rate limiting на мутирующих endpoint'ах
- Только студенческая почта `@student.spbu.ru` для регистрации
- Оценки требуют подтверждённой почты
- Production-секрет проверяется при старте
- `.env` исключён из Docker-образа и git

## Лицензия

MIT
