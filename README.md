# BasedCollective

An invite-only web forum platform with Worldcoin identity verification, star-rank reputation system, structured moderation, and curated invite pipeline.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + Node.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Media**: Cloudflare R2 (S3-compatible)
- **Email**: Resend
- **Identity**: Worldcoin World ID
- **Monorepo**: Turborepo

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd basedcollective

# Start local PostgreSQL
docker compose up -d

# Install dependencies
npm install

# Copy environment variables
cp .env.example apps/api/.env
echo 'NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1' > apps/web/.env.local

# Generate Prisma client and run migrations
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ../..

# Start development servers
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/v1/health

## Project Structure

```
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── packages/
│   └── shared/       # Shared types, constants, validation
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test` | Run all tests |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
