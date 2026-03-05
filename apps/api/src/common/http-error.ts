import { BadRequestException } from '@nestjs/common';
import { ZodError, type ZodTypeAny, type infer as ZodInfer } from 'zod';

export function parseOrThrow<TSchema extends ZodTypeAny>(
  schema: TSchema,
  input: unknown
): ZodInfer<TSchema> {
  try {
    return schema.parse(input) as ZodInfer<TSchema>;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(error.flatten());
    }
    throw error;
  }
}
