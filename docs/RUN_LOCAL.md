# RUN_LOCAL

## 1. Prerequisites
- Docker Engine + Docker Compose plugin
- Free ports: `8080`, `9000`, `9001`

## 2. Configure env
1. Copy template:
   - `cp .env.example .env`
2. For default local mode keep:
   - `IMAGE_PROVIDER=mock`
   - `PAYMENT_PROVIDER=mock`
   - `TELEGRAM_AUTH_MODE=mock`

## 3. Start everything
```bash
docker compose -f infra/docker/docker-compose.dev.yml up --build
```

## 4. Open services
- Web EN: [http://localhost:8080/](http://localhost:8080/)
- Web RU: [http://localhost:8080/ru](http://localhost:8080/ru)
- API health: [http://localhost:8080/api/health](http://localhost:8080/api/health)
- MinIO console (optional): [http://localhost:9001](http://localhost:9001)

## 5. Admin access
- Web admin page: [http://localhost:8080/admin/styles](http://localhost:8080/admin/styles)
- Basic auth credentials from `.env`:
  - `BASIC_AUTH_USER`
  - `BASIC_AUTH_PASS`

## 6. Mock generation smoke test
1. Open `http://localhost:8080/app`
2. Upload 1+ photos (jpeg/png/webp)
3. Click upload, then generate
4. Wait until job status is `done`
5. You should see 6 mock output images (default)

## 7. RU flow smoke test
1. Open `http://localhost:8080/ru/app`
2. In dev mock mode, Telegram auth uses fallback `mock:<id>` automatically
3. Open `http://localhost:8080/ru/pay`
4. Click package buy
5. With `PAYMENT_PROVIDER=mock` payment becomes paid instantly and credits are added

## 8. Useful commands
```bash
pnpm db:migrate
pnpm db:seed
pnpm lint
pnpm test
```
