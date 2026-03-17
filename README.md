# AIaaS Platform

A simple AI as a Service management panel built with Next.js 16, TypeScript, and Prisma.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite via Prisma 7 + BetterSQLite3 adapter
- **Auth**: Stateless JWT sessions (jose) with HMAC-signed cookies
- **Styling**: Tailwind CSS
- **Validation**: Zod v4

## Architecture

```
app/
├── (auth)/              # Auth route group
│   ├── login/page.tsx   # Login form (useActionState)
│   └── signup/page.tsx  # Signup form with role selection
├── (dashboard)/
│   └── dashboard/page.tsx  # Role-based dashboard (admin/user)
├── actions/auth.ts      # Server Actions: login, signup, logout
├── components/          # UI components
│   ├── admin-dashboard.tsx
│   ├── user-dashboard.tsx
│   └── logout-button.tsx
├── lib/
│   ├── session.ts       # JWT encrypt/decrypt, cookie management
│   ├── dal.ts           # Data Access Layer (verifySession, getUser)
│   ├── password.ts      # Password hashing (Node.js crypto.scrypt)
│   └── definitions.ts   # Zod schemas and TypeScript types
└── page.tsx             # Root redirect (→ dashboard or login)

lib/prisma.ts            # Prisma client singleton
proxy.ts                 # Route protection (Next.js 16 proxy)
prisma/
├── schema.prisma        # User, ApiKey, UsageLog models
└── seed.ts              # Seed data with hashed passwords
```

### Auth Flow

1. **Registration/Login** — Server Actions validate input (Zod), hash passwords (crypto.scrypt), and create signed JWT session cookies (jose).
2. **Route Protection** — `proxy.ts` intercepts all requests, decrypts the session cookie, and redirects based on auth state and role.
3. **Server-side Auth** — `verifySession()` from DAL is used in Server Components with React `cache()` for deduplication.
4. **Role-based Rendering** — Dashboard conditionally renders admin or user views based on session role.

### Roles

- **USER**: Can manage own API keys and use AI endpoints
- **ADMIN**: Can view all users, all API keys, and platform-wide usage logs

## Getting Started

```bash
# Install dependencies
npm install

# Set up the database and seed
npx prisma migrate dev
npx prisma db seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seeded Accounts

| Email             | Password      | Role  |
|-------------------|---------------|-------|
| admin@aiaas.dev   | password123   | ADMIN |
| user@aiaas.dev    | password123   | USER  |

### Environment Variables

Create a `.env` file in the project root:

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="<your-base64-secret>"
```

Generate a session secret with: `openssl rand -base64 32`
