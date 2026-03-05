FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl vips-dev
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

COPY package.json pnpm-workspace.yaml tsconfig.base.json .
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @picoria/db generate

EXPOSE 3002
CMD ["pnpm", "--filter", "@picoria/worker", "start"]
