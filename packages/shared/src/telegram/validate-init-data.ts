import { createHmac } from 'node:crypto';

export interface TelegramUserData {
  telegramId: string;
  raw: Record<string, string>;
}

export function parseTelegramInitData(initData: string): Record<string, string> {
  const params = new URLSearchParams(initData);
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

export function validateTelegramInitDataStrict(initData: string, botToken: string): TelegramUserData {
  const params = parseTelegramInitData(initData);
  const receivedHash = params.hash;
  if (!receivedHash) {
    throw new Error('Telegram initData hash is missing');
  }

  const checkString = Object.keys(params)
    .filter((key) => key !== 'hash')
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${params[key]}`)
    .join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const generatedHash = createHmac('sha256', secretKey).update(checkString).digest('hex');

  if (generatedHash !== receivedHash) {
    throw new Error('Telegram initData signature is invalid');
  }

  const userRaw = params.user;
  if (!userRaw) {
    throw new Error('Telegram initData user is missing');
  }
  const user = JSON.parse(userRaw) as { id?: number | string };
  if (!user.id) {
    throw new Error('Telegram user id is missing');
  }

  return {
    telegramId: String(user.id),
    raw: params
  };
}

export function validateTelegramInitData(
  initData: string,
  mode: 'strict' | 'mock',
  botToken?: string
): TelegramUserData {
  if (mode === 'mock') {
    if (!initData.startsWith('mock:')) {
      throw new Error('Invalid mock initData format. Expected mock:<telegramId>');
    }
    const telegramId = initData.slice('mock:'.length).trim();
    if (!telegramId) {
      throw new Error('Mock telegramId is empty');
    }
    return { telegramId, raw: { mock: initData } };
  }

  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required for strict mode');
  }

  return validateTelegramInitDataStrict(initData, botToken);
}
