# Guardian Backend

REST + WebSocket API for **Guardian**, a real-time account security companion. It receives security events (new login, password change, etc.), classifies their risk, stores them, and pushes live alerts to the web dashboard and the Android app.

## Tech stack

- Node.js 20.6+ (ES modules), Express 5
- PostgreSQL (Neon) with Prisma 6
- JWT auth (httpOnly cookie for web, Bearer token for Android)
- `ws` for real-time alerts, `bcryptjs` for password hashing

## Project structure

```
guardian-backend/
├── app.js                  entry point
├── prisma/schema.prisma    database models
├── config/                 db client, official security links
├── middleware/             auth, cors, error handler
├── services/               risk engine, WebSocket layer
├── controllers/            request handling and database logic
└── routes/                 URL -> controller mapping
```

## Getting started

```bash
npm install
cp .env.example .env        # fill in the values below
npx prisma db push          # creates the tables
npm run dev                 # http://localhost:4000
```

### Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon URL ending in `?sslmode=require`) |
| `JWT_SECRET` | Long random string used to sign tokens |
| `CLIENT_URL` | Frontend origin allowed by CORS, e.g. `http://localhost:3000` |
| `PORT` | Server port (default `4000`) |

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start with auto-restart, loading `.env` |
| `npm start` | Start for production (env vars come from the host) |
| `npm run db:migrate` | Run `prisma migrate dev` |

## API

All routes except register and login require authentication: the `token` cookie or an `Authorization: Bearer <token>` header. Errors are returned as `{ "error": "message" }`.

### Auth

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `name`, `email`, `password` (8+ chars) | 201 `{ user, token }` |
| POST | `/auth/login` | `email`, `password` | `{ user, token }` |
| POST | `/auth/logout` | none | 204 |
| GET | `/auth/me` | none | `{ user }` |

### Accounts

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/accounts` | none | list of accounts |
| POST | `/accounts` | `platform`, `username` | 201 account |
| DELETE | `/accounts/:id` | none | 204 |

### Events

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/events?accountId=` | none | up to 100 events, newest first |
| POST | `/events` | `accountId`, `eventType`, `device?` | 201 `{ event, siren }` |
| POST | `/events/:id/respond` | `response`: `recognized` or `secure` | `{ status, securityUrl? }` |

Valid `eventType` values: `new_login`, `new_device`, `password_change`, `recovery_change`, `security_setting_change`, `suspicious_activity`.

### Devices

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/devices` | none | list of trusted devices |
| POST | `/devices` | `name`, `type?` | 201 device |
| DELETE | `/devices/:id` | none | 204 |

### Settings (sleep protection)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/settings` | none | `{ sleepMode, sleepStart, sleepEnd }` |
| PUT | `/settings` | any of `sleepMode`, `sleepStart`, `sleepEnd` (`HH:MM`, 24h) | updated settings |

### Chatbot

`POST /chat` with `{ "message": "..." }` returns `{ reply, events }`. It is rule-based and understands questions about sleeping hours, today's alerts, the latest event, and unresolved high-risk events.

## Real-time alerts

Connect to `ws://<host>/ws` (the cookie or Bearer header authenticates the connection). When an event is created, the server pushes:

```json
{ "type": "alert", "siren": true, "event": { "...": "..." } }
```

## Risk rules

Defined in `services/risk.js`.

| Event | Severity |
|---|---|
| `password_change`, `recovery_change` | CRITICAL |
| `security_setting_change`, `suspicious_activity` | HIGH |
| `new_login`, `new_device` from a trusted device | LOW |
| `new_login`, `new_device` from an unknown device | HIGH |
| anything else | MEDIUM |

`siren` is `true` for CRITICAL events, and for HIGH events while the user's sleep window is active. A device counts as trusted when its name exactly matches a trusted device.

## Quick test

```bash
curl -c jar.txt -X POST localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@test.com","password":"password123"}'

curl -b jar.txt -X POST localhost:4000/accounts \
  -H "Content-Type: application/json" \
  -d '{"platform":"instagram","username":"test"}'

curl -b jar.txt -X POST localhost:4000/events \
  -H "Content-Type: application/json" \
  -d '{"accountId":"<ID_FROM_PREVIOUS_RESPONSE>","eventType":"password_change"}'
```

The last response should contain `"severity":"CRITICAL"` and `"siren":true`.

## Notes

- Platforms such as Instagram do not expose login events through public APIs. Events come from the web dashboard's simulate tool or from the Guardian Android app, which reads security notifications on the phone and posts them to `POST /events`.
- Guardian never stores passwords for connected accounts, only the username.
- Sleep windows use the server's local time. Add a timezone field to `UserSettings` if you deploy to a different timezone than your users.
- When the frontend and backend are on different domains in production, set the auth cookie to `SameSite=None; Secure`, or serve both under one parent domain.