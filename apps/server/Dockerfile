# syntax=docker/dockerfile:1
FROM node:24 AS base
RUN corepack enable pnpm

FROM base AS build
WORKDIR /app
ENV CI=true
# Copy root configurations and package manifests to install dependencies
COPY package.json pnpm-*.yaml ./
COPY --parents **/package.json .
RUN pnpm install --frozen-lockfile
# Copy the rest of the source code
COPY . .
# Run the build
RUN pnpm --filter server run build
# Deploy the application to a pruned directory
RUN pnpm --filter server --prod deploy --legacy server-pruned
# Copy the built dist directory manually since pnpm deploy ignores it due to .gitignore
RUN cp -r apps/server/dist server-pruned/dist

FROM base AS deploy
WORKDIR /app
COPY --from=build /app/server-pruned .
CMD ["node", "dist/main"]
EXPOSE ${PORT:-3000}
