export type UserType = 'guest' | 'telegram' | 'local' | 'vk' | 'yandex';
export type UserRole = 'user' | 'admin';
export type Locale = 'en' | 'ru';

export type AssetKind = 'input' | 'preview' | 'output';

export type JobStatus =
  | 'queued'
  | 'processing'
  | 'uploading_results'
  | 'done'
  | 'failed'
  | 'canceled';

export type PaymentProvider = 'tbank';

export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'canceled';

export type LedgerReason = 'purchase' | 'spend' | 'refund' | 'admin';

export interface SessionClaims {
  sub: string;
  type: UserType;
  role: UserRole;
  locale: Locale;
  email?: string;
  name?: string;
  tgId?: string;
}
