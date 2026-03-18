# AIaaS Platform

Frontend-first AI as a Service admin panel built for a case study with Next.js 16, TypeScript, Prisma, and SQLite.

The product has two workspaces:
- `USER`: create, copy, list, disable, and use personal API keys
- `ADMIN`: view all users, all keys, usage logs, and disable keys individually or in bulk

## Tech Stack

- Next.js 16 App Router
- TypeScript with strict mode
- Tailwind CSS
- Prisma 7 with SQLite and BetterSQLite3
- `jose` for JWT-based sessions
- Zod v4 for validation
- SWR + Recharts for dashboard analytics
- Vitest for unit and integration tests

## Product Surface

### User workspace

- `/dashboard`: personal usage summary for `24h` and `7d`
- `/api-keys`: create, list, copy, and disable owned API keys
- `/playground`: choose a key, send a prompt, and inspect the AI response

### Admin workspace

- `/admin`: platform summary with top API users and top endpoints
- `/admin/users`: list all users with role and key count
- `/admin/api-keys`: list all keys and disable one or many keys
- `/admin/logs`: inspect request logs with endpoint, status, latency, key, and user context

## Architecture Notes

- Authentication is based on the
  [Next.js Authentication Guide](https://nextjs.org/docs/pages/guides/authentication),
  which was the main starting point for the implementation.
- The app uses cookie-based auth with a signed JWT session stored in an `httpOnly` cookie.
  The token contains the user id, role, and expiry, and is verified on the server for
  protected pages and route handlers.
- Authorization is role-based from the session payload. `proxy.ts` only performs lightweight
  cookie checks and redirects; real access control stays on the server.
- Server Components are used for initial page data.
- Route Handlers back the key-management and AI playground workflows.
- `UsageLog` is the analytics source for user and admin dashboards.

## Local Development

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seeded Accounts

| Email           | Password    | Role  |
|----------------|-------------|-------|
| admin@aiaas.dev | password123 | ADMIN |
| user@aiaas.dev  | password123 | USER  |

## Tests

```bash
npm test
```


