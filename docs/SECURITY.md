# SECURITY

## Secrets and env
- Never commit `.env`.
- Rotate regularly:
  - `JWT_SECRET`
  - `TBANK_PASSWORD`
  - `S3_SECRET_KEY`
  - `TELEGRAM_BOT_TOKEN`
- Use per-environment credentials (dev/stage/prod).

## Auth and cookies
- Session cookie: `pc_sid` (httpOnly, sameSite=lax, secure=true in production).
- Guest anti-abuse cookie: `pc_anon`.
- Force `COOKIE_SECURE=true` under HTTPS.

## Telegram auth
- Production: `TELEGRAM_AUTH_MODE=strict`.
- Development: `TELEGRAM_AUTH_MODE=mock`.
- Validate initData signature using bot token HMAC algorithm.

## T-Bank payments
- Generate Init `Token` only from root fields + `Password`, sorted keys, SHA-256 hex.
- Verify webhook `Token` excluding nested objects and excluding incoming `Token`.
- Webhook handler idempotent: paid credits granted once only.
- Always return HTTP 200 with body `OK` after successful handling.

## Credits idempotency
- Ledger uniqueness: `(userId, reason, refId)`.
- Prevent duplicate purchase/refund on retries and webhook repeats.

## Storage safety
- Validate upload MIME and max size.
- Use short-lived presigned URLs.
- Do not expose raw private object keys publicly.
- Strip metadata/EXIF from generated previews.

## Logging
- Avoid logging secrets, payment passwords, full webhook payload with sensitive fields.
- Keep error logs bounded and sanitized.

## Network and infra
- Keep public ports minimal: 80/443 (+ SSH).
- Internal services (postgres/redis) should not be internet-facing.
- Use external RU S3 for production media durability and backup strategy.
