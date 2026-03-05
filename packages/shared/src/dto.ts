import { z } from 'zod';

export const createJobDtoSchema = z.object({
  styleSlug: z.string().min(1),
  inputAssetIds: z.array(z.string().uuid()).min(1).max(20),
  clientRequestId: z.string().min(1).max(128).optional()
});

export const presignUploadDtoSchema = z.object({
  kind: z.literal('input'),
  mime: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  sizeBytes: z.number().int().positive().max(50 * 1024 * 1024)
});

export const completeAssetDtoSchema = z.object({
  assetId: z.string().uuid(),
  width: z.number().int().positive(),
  height: z.number().int().positive()
});

export const telegramAuthDtoSchema = z.object({
  initData: z.string().min(1)
});

export const createPaymentDtoSchema = z.object({
  packageId: z.string().uuid()
});

export const webhookTBankDtoSchema = z
  .object({
    Token: z.string().min(1)
  })
  .passthrough();

export type CreateJobDto = z.infer<typeof createJobDtoSchema>;
export type PresignUploadDto = z.infer<typeof presignUploadDtoSchema>;
export type CompleteAssetDto = z.infer<typeof completeAssetDtoSchema>;
export type TelegramAuthDto = z.infer<typeof telegramAuthDtoSchema>;
export type CreatePaymentDto = z.infer<typeof createPaymentDtoSchema>;
export type WebhookTBankDto = z.infer<typeof webhookTBankDtoSchema>;
