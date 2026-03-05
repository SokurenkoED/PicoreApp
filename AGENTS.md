# Picoria Site Context For Agents

## Project snapshot
- Monorepo: `apps/web` (Next.js 14), `apps/api` (NestJS + Fastify), `apps/worker` (BullMQ worker), `apps/bot` (Telegram bot).
- Main product: AI photoshoot SaaS with EN and RU locale branches, async generation, style catalog, RU payments.
- Local dev entrypoint is typically `http://localhost:8090` through Caddy reverse proxy.

## Runtime topology (dev)
- `caddy` exposes `8090:80`.
- `web` (Next.js) runs on `3000` behind Caddy.
- `api` (NestJS) runs on `3001`; Caddy maps `/api/*` to it.
- `worker` runs on `3002` (health endpoint), processes generation queue.
- Infra: Postgres, Redis, MinIO.

## Public route model
- EN homepage: `/`
- RU homepage: `/ru`
- EN catalog: `/styles`
- RU catalog: `/ru/styles`
- EN app: `/app`
- RU app: `/ru/app`
- RU payments: `/ru/pay`
- EN style detail: `/style/[slug]`
- RU style detail: `/ru/style/[slug]`
- EN section detail: `/[section]`
- RU section detail: `/ru/[section]`
- Admin styles page (basic auth): `/admin/styles`

## Localized section pairs (1:1 mapping)
- `/ai-photoshoots` <-> `/ru/neiro-fotosessii`
- `/ready-looks` <-> `/ru/gotovye-obrazy`
- `/animate-photo` <-> `/ru/ozhivit-foto`
- `/blog` <-> `/ru/blog`
- `/reviews` <-> `/ru/otzyvy`
- `/faq` <-> `/ru/faq`
- `/partnerships` <-> `/ru/sotrudnichestvo`

## Content sources
- Section pages are static content from:
  - `apps/web/src/lib/en-sections.ts`
  - `apps/web/src/lib/ru-sections.ts`
- Style list/detail pages are dynamic from API:
  - `GET /api/styles?lang=en|ru`
  - `GET /api/styles/:slug?lang=en|ru`
- Style slug is shared across locales; localized title/description/faq come from DB fields.

## SEO rules for localized pages
- Different URLs per locale are required and correct for SEO.
- Example pair: `/ru/neiro-fotosessii` and `/ai-photoshoots`.
- Keep strict 1:1 mapping between localized versions.
- Use self-referencing canonical for each localized URL.
- Do not canonicalize RU to EN or EN to RU.
- Avoid forced geo/language redirects without user choice.

## Current SEO implementation notes
- Implemented:
  - `robots` includes both sitemaps and disallows app/payment pages from indexing.
  - EN sitemap: `/sitemap.xml` (home, EN sections, EN styles).
  - RU sitemap: `/ru/sitemap.xml` (RU home, RU sections, RU styles).
  - Style detail pages already set canonical + locale alternates (`en`/`ru`).
- Important gaps to keep in mind:
  - Section pages currently set canonical only; locale alternates (`hreflang`) are not yet emitted there.
  - Root HTML tag is currently `lang="en"` for all pages; RU pages do not override it in a dedicated RU layout.
