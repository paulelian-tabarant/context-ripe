FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY api/package.json ./api/

RUN pnpm install --filter api --frozen-lockfile

COPY api/ ./api/
RUN pnpm --filter api build


FROM node:22-alpine AS production

RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY api/package.json ./api/

RUN pnpm install --filter api --frozen-lockfile --prod

COPY --from=builder /app/api/dist ./api/dist

EXPOSE 3000

CMD ["node", "api/dist/index.js"]
