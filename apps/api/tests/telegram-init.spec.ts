import { createHmac } from 'node:crypto';
import { validateTelegramInitData } from '@picoria/shared';

function buildInitData(botToken: string): string {
  const user = JSON.stringify({ id: 12345, first_name: 'Picoria' });
  const pairs: Record<string, string> = {
    auth_date: '1700000000',
    query_id: 'AAEAAAE',
    user
  };

  const dataCheckString = Object.keys(pairs)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${pairs[key]}`)
    .join('\n');

  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = createHmac('sha256', secret).update(dataCheckString).digest('hex');

  const params = new URLSearchParams({ ...pairs, hash });
  return params.toString();
}

describe('telegram initData validation', () => {
  it('accepts mock mode payload', () => {
    const result = validateTelegramInitData('mock:777', 'mock');
    expect(result.telegramId).toBe('777');
  });

  it('validates strict payload signature', () => {
    const botToken = '12345:token';
    const initData = buildInitData(botToken);
    const result = validateTelegramInitData(initData, 'strict', botToken);
    expect(result.telegramId).toBe('12345');
  });
});
