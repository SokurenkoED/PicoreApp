import { createTBankToken, verifyTBankWebhookToken } from '@picoria/shared';

describe('T-Bank token utils', () => {
  it('creates stable init token from root fields only', () => {
    const payload = {
      TerminalKey: 'T1',
      Amount: 1000,
      OrderId: 'ord_1',
      Description: 'desc',
      Data: { skip: true }
    };

    const token = createTBankToken(payload, 'pass');
    expect(token).toHaveLength(64);

    const token2 = createTBankToken({ ...payload, Data: { changed: true } }, 'pass');
    expect(token2).toEqual(token);
  });

  it('verifies webhook token', () => {
    const webhook = {
      TerminalKey: 'T1',
      Amount: 1000,
      OrderId: 'ord_1',
      Status: 'CONFIRMED'
    };
    const token = createTBankToken(webhook, 'pass');
    const payload = { ...webhook, Token: token };

    expect(verifyTBankWebhookToken(payload, 'pass')).toBe(true);
    expect(verifyTBankWebhookToken(payload, 'wrong')).toBe(false);
  });
});
