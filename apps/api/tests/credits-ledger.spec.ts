import { CreditsService } from '../src/credits/credits.service';

describe('credits ledger idempotency intent', () => {
  it('treats duplicate purchase insert as idempotent', async () => {
    const create = jest.fn();
    const db = {
      creditsLedger: {
        create,
        aggregate: jest.fn().mockResolvedValue({ _sum: { delta: 0 } })
      },
      $transaction: jest.fn()
    } as any;

    const service = new CreditsService(db);
    const knownError = { code: 'P2002' };
    create.mockRejectedValueOnce(knownError);

    await expect(service.addPurchase('u1', 10, 'p1')).resolves.toBeUndefined();
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('is idempotent when refund write retries', async () => {
    const create = jest.fn();
    const db = {
      creditsLedger: {
        create,
        aggregate: jest.fn().mockResolvedValue({ _sum: { delta: 0 } })
      },
      $transaction: jest.fn()
    } as any;

    const service = new CreditsService(db);
    const knownError = { code: 'P2002' };

    create.mockResolvedValueOnce(undefined);
    create.mockRejectedValueOnce(knownError);

    await expect(service.refundForJob('u1', 'j1', 1)).resolves.toBeUndefined();
    await expect(service.refundForJob('u1', 'j1', 1)).resolves.toBeUndefined();
    expect(create).toHaveBeenCalledTimes(2);
  });
});
