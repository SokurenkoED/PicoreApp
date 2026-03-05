import { createHash } from 'node:crypto';

function flattenRootValues(payload: Record<string, unknown>, excludeKeys: string[] = []): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (excludeKeys.includes(key)) {
      continue;
    }
    if (value === null || value === undefined) {
      continue;
    }
    if (typeof value === 'object') {
      continue;
    }
    out[key] = String(value);
  }
  return out;
}

export function createTBankToken(payload: Record<string, unknown>, password: string): string {
  const fields = flattenRootValues(payload);
  fields.Password = password;
  const source = Object.keys(fields)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => fields[key])
    .join('');
  return createHash('sha256').update(source, 'utf8').digest('hex');
}

export function verifyTBankWebhookToken(
  payload: Record<string, unknown>,
  password: string,
  token?: string
): boolean {
  const webhookToken = token ?? String(payload.Token ?? '');
  if (!webhookToken) {
    return false;
  }

  const fields = flattenRootValues(payload, ['Token']);
  delete fields.Data;
  delete fields.Receipt;
  fields.Password = password;

  const source = Object.keys(fields)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => fields[key])
    .join('');

  const expected = createHash('sha256').update(source, 'utf8').digest('hex');
  return expected.toLowerCase() === webhookToken.toLowerCase();
}
