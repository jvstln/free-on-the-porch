# free-on-the-pouch

An app where users can post unwanted household items they are giving away for free. They place the item outside on their porch, curb, driveway, or pickup area, take a photo, add a short description, and pin the location. Other users nearby can browse free items on a map or feed and go pick them up.

> Originally scaffolded with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) (see `bts.jsonc`); the stack has since diverged significantly.

## Features

- **TypeScript** - For type safety and improved developer experience
- **React Native** - Build mobile apps using React
- **Expo** - Tools for React Native development (Expo Router, SDK ~55)
- **TailwindCSS** - Utility-first CSS for rapid development (Uniwind on native)
- **NestJS** - Backend API framework (global prefix `/api/v1`, Swagger UI at `/docs`)
- **Node.js** - Runtime environment
- **Drizzle ORM** - TypeScript-first ORM against PostgreSQL with **PostGIS**
- **Authentication** - Better Auth (email/password + email verification)
- **Realtime** - Socket.IO gateways alongside REST endpoints
- **Biome** - Linting and formatting
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Database Setup

This project uses PostgreSQL with PostGIS and Drizzle ORM.

1. Start the database (PostGIS image; port from `.env` `DATABASE_PORT`):

```bash
docker compose up -d db
```

2. Enable the PostGIS extension (needed after first start / fresh volume):

```bash
pnpm run db:init
```

3. Push the Drizzle schema to the database:

```bash
pnpm run db:push
```

Then, run the development server:

```bash
pnpm run dev
```

Use the Expo Go app (or a dev client) to run the mobile application.
The API runs at [http://localhost:3000/api/v1](http://localhost:3000/api/v1), Swagger UI at [/docs](http://localhost:3000/docs).

## Git Hooks and Formatting

- Format and lint fix: `pnpm run check`

## Project Structure

```
free-on-the-pouch/
├── apps/
│   ├── native/      # Mobile application (Expo, Expo Router, HeroUI Native + Uniwind)
│   └── server/      # Backend API (NestJS, Drizzle ORM, Socket.IO)
└── packages/
    ├── config/      # Shared tsconfig
    ├── db/          # Drizzle client & schema (PostGIS)
    ├── env/         # Zod-validated env vars (server + public)
    └── shared/      # Zod schemas, utils, assets shared by server and native
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run dev:native`: Start only the Expo dev server
- `pnpm run dev:server`: Start only the API server
- `pnpm run build`: Build all applications
- `pnpm run check-types`: Check TypeScript types across all packages
- `pnpm run check`: Run Biome formatting and linting (with fixes)
- `pnpm run db:init`: Create the PostGIS extension in the database
- `pnpm run db:push`: Push schema changes to database
- `pnpm run db:generate`: Generate database migrations
- `pnpm run db:migrate`: Run database migrations
- `pnpm run db:studio`: Open database studio UI
- `pnpm run db:seed`: Seed the database
