import { createServer } from 'node:http';
import { Bot, webhookCallback } from 'grammy';

const token = process.env.TELEGRAM_BOT_TOKEN;
const username = process.env.TELEGRAM_BOT_USERNAME ?? 'picoria_bot';
const webAppUrl = process.env.TELEGRAM_BOT_WEBAPP_URL ?? 'http://localhost:8080/ru/app';
const mode = process.env.BOT_MODE ?? 'polling';
const webhookPath = process.env.BOT_WEBHOOK_PATH ?? '/bot/webhook';
const port = Number.parseInt(process.env.BOT_PORT ?? '3003', 10);

const server = createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'bot', enabled: Boolean(token) }));
    return;
  }

  res.writeHead(404);
  res.end('not found');
});

if (!token) {
  console.log('TELEGRAM_BOT_TOKEN is not set. Bot handlers are disabled.');
} else {
  const bot = new Bot(token);

  bot.command('start', async (ctx) => {
    await ctx.reply(
      `Picoria AI Photoshoot. Open mini app: ${webAppUrl}\nBot: @${username}`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Open Picoria', web_app: { url: webAppUrl } }]]
        }
      }
    );
  });

  bot.command('app', async (ctx) => {
    await ctx.reply('Open Picoria mini app', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Open app', web_app: { url: webAppUrl } }]]
      }
    });
  });

  bot.catch((err) => {
    console.error('Bot error', err.error);
  });

  if (mode === 'webhook') {
    const callback = webhookCallback(bot, 'http');
    server.removeAllListeners('request');
    server.on('request', (req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, service: 'bot', enabled: true }));
        return;
      }
      if (req.url === webhookPath && req.method === 'POST') {
        void callback(req as any, res as any);
        return;
      }
      res.writeHead(404);
      res.end('not found');
    });
    console.log(`Bot webhook mode enabled at path ${webhookPath}`);
  } else {
    bot.start();
    console.log('Bot started in polling mode');
  }

  const stop = async () => {
    await bot.stop();
    server.close();
  };

  process.on('SIGINT', () => {
    stop().finally(() => process.exit(0));
  });
  process.on('SIGTERM', () => {
    stop().finally(() => process.exit(0));
  });
}

server.listen(port, '0.0.0.0', () => {
  console.log(`Bot health endpoint listening on ${port}`);
});
