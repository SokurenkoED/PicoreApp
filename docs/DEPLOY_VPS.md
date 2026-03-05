# DEPLOY_VPS

## Target
Ubuntu 22.04/24.04 on RU VPS.

## 1. Install Docker + Compose
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```
Re-login after group change.

## 2. Firewall (UFW)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 3. Deploy project
```bash
git clone <your-repo-url> picoria
cd picoria
cp .env.example .env
```
Set production values in `.env`:
- `NODE_ENV=production`
- `DOMAIN=your-domain.tld`
- strong secrets: `JWT_SECRET`, `TBANK_PASSWORD`, `S3_SECRET_KEY`
- external RU S3 values (`S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, keys)
- Telegram bot values
- `PAYMENT_PROVIDER=tbank`
- `TELEGRAM_AUTH_MODE=strict`

## 4. Start production stack
```bash
docker compose -f infra/docker/docker-compose.prod.yml up -d --build
```

## 5. DNS + HTTPS
- Point `A` record for your domain to VPS IP
- Caddy reads `DOMAIN` env and issues TLS automatically
- Verify:
  - `https://your-domain.tld/`
  - `https://your-domain.tld/api/health`

## 6. Database backup to S3 (cron + pg_dump)
Create `/usr/local/bin/picoria-backup.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_FILE="/tmp/picoria-${STAMP}.sql.gz"

docker exec $(docker ps --filter name=postgres --format '{{.Names}}' | head -n1) \
  pg_dump -U ${POSTGRES_USER:-picoria} ${POSTGRES_DB:-picoria} | gzip > "$BACKUP_FILE"

aws s3 cp "$BACKUP_FILE" s3://<backup-bucket>/picoria/ --endpoint-url <ru-s3-endpoint>
rm -f "$BACKUP_FILE"
```
Add cron:
```bash
crontab -e
# daily at 03:30 UTC
30 3 * * * /usr/local/bin/picoria-backup.sh >> /var/log/picoria-backup.log 2>&1
```

## 7. Update rollout
```bash
git pull
docker compose -f infra/docker/docker-compose.prod.yml up -d --build
```
