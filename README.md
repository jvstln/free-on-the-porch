# free-on-the-pouch

An app where users can post unwanted household items they are giving away for free. They place the item outside on their porch, curb, driveway, or pickup area, take a photo, add a short description, and pin the location. Other users nearby can browse free items on a map or feed and go pick them up.

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React Native, Expo, Express, and more.
The base code for this particular project can be recreated using the command:

```bash
pnpm create better-t-stack@latest free-on-the-pouch --frontend native-uniwind --backend express --runtime node --database postgres --orm prisma --api none --auth better-auth --payments none --addons biome skills turborepo --examples none --db-setup none --web-deploy none --server-deploy none --git --package-manager pnpm --no-install
```

## Features

- **TypeScript** - For type safety and improved developer experience
- **React Native** - Build mobile apps using React
- **Expo** - Tools for React Native development
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Express** - Fast, unopinionated web framework
- **Node.js** - Runtime environment
- **Prisma** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Biome** - Linting and formatting
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Database Setup

This project uses PostgreSQL with Prisma.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:

```bash
pnpm run db:push
```

Then, run the development server:

```bash
pnpm run dev
```

Use the Expo Go app to run the mobile application.
The API is running at [http://localhost:3000](http://localhost:3000).

## Git Hooks and Formatting

- Format and lint fix: `pnpm run check`

## Project Structure

```
free-on-the-pouch/
├── apps/
│   ├── native/      # Mobile application (React Native, Expo)
│   └── server/      # Backend API (Express)
├── packages/
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:server`: Start only the server
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm run dev:native`: Start the React Native/Expo development server
- `pnpm run db:push`: Push schema changes to database
- `pnpm run db:generate`: Generate database client/types
- `pnpm run db:migrate`: Run database migrations
- `pnpm run db:studio`: Open database studio UI
- `pnpm run check`: Run Biome formatting and linting
