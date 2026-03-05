import type { ImageProvider } from '@picoria/shared';
import { MockProvider } from './mock.provider';
import { HttpProvider } from './http.provider';

export function createImageProvider(): ImageProvider {
  const provider = process.env.IMAGE_PROVIDER ?? 'mock';
  if (provider === 'http') {
    const baseUrl = process.env.HTTP_PROVIDER_BASE_URL;
    const apiKey = process.env.HTTP_PROVIDER_API_KEY;
    if (!baseUrl || !apiKey) {
      throw new Error('HTTP_PROVIDER_BASE_URL and HTTP_PROVIDER_API_KEY are required for IMAGE_PROVIDER=http');
    }

    return new HttpProvider({
      baseUrl,
      apiKey,
      mode: (process.env.HTTP_PROVIDER_MODE as 'base64' | 'url' | undefined) ?? 'base64',
      timeoutMs: Number.parseInt(process.env.HTTP_PROVIDER_TIMEOUT_MS ?? '60000', 10)
    });
  }

  return new MockProvider();
}
