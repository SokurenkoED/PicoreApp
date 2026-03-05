export interface GenerationInput {
  assetId: string;
  url: string;
  mime?: string | null;
}

export interface GenerationRequest {
  jobId: string;
  styleSlug: string;
  promptTemplate?: string | null;
  params?: Record<string, unknown>;
  inputs: GenerationInput[];
  outputCount: number;
}

export type ProviderResult =
  | {
      mode: 'base64';
      images: Array<{ data: string; mime?: string }>;
    }
  | {
      mode: 'url';
      images: Array<{ url: string; mime?: string }>;
    };

export interface ImageProvider {
  key: string;
  generate(request: GenerationRequest): Promise<ProviderResult>;
}

export interface InitPaymentInput {
  orderId: string;
  amountKopeks: number;
  description: string;
  notificationUrl: string;
  successUrl: string;
  failUrl: string;
  language?: 'ru' | 'en';
}

export interface InitPaymentResult {
  providerPaymentId: string;
  paymentUrl: string;
  status: string;
  raw: unknown;
}

export interface PaymentProviderService {
  initPayment(input: InitPaymentInput): Promise<InitPaymentResult>;
  verifyWebhook(payload: Record<string, unknown>): boolean;
}
