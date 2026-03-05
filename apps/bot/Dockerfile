FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

COPY package.json pnpm-workspace.yaml tsconfig.base.json .
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --no-frozen-lockfile

EXPOSE 3003
CMD ["pnpm", "--filter", "@picoria/bot", "start"]
