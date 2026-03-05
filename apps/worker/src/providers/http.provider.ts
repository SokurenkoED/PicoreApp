import type { ImageProvider, ProviderResult, GenerationRequest } from '@picoria/shared';

interface HttpProviderConfig {
  baseUrl: string;
  apiKey: string;
  mode: 'base64' | 'url';
  timeoutMs: number;
}

function normalizeBase64Images(images: unknown[]): Array<{ data: string; mime?: string }> {
  return images.map((item) => {
    if (typeof item === 'string') {
      return { data: item, mime: 'image/jpeg' };
    }
    if (item && typeof item === 'object' && 'data' in item && typeof item.data === 'string') {
      const typed = item as { data: string; mime?: unknown };
      return {
        data: typed.data,
        mime: typeof typed.mime === 'string' ? typed.mime : 'image/jpeg'
      };
    }
    throw new Error('Invalid base64 image payload from HttpProvider');
  });
}

function normalizeUrlImages(images: unknown[]): Array<{ url: string; mime?: string }> {
  return images.map((item) => {
    if (typeof item === 'string') {
      return { url: item, mime: 'image/jpeg' };
    }
    if (item && typeof item === 'object' && 'url' in item && typeof item.url === 'string') {
      const typed = item as { url: string; mime?: unknown };
      return {
        url: typed.url,
        mime: typeof typed.mime === 'string' ? typed.mime : 'image/jpeg'
      };
    }
    throw new Error('Invalid URL image payload from HttpProvider');
  });
}

export class HttpProvider implements ImageProvider {
  key = 'http';

  constructor(private readonly config: HttpProviderConfig) {}

  async generate(request: GenerationRequest): Promise<ProviderResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          jobId: request.jobId,
          styleSlug: request.styleSlug,
          promptTemplate: request.promptTemplate,
          params: request.params,
          inputs: request.inputs,
          outputCount: request.outputCount,
          mode: this.config.mode
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HttpProvider failed with status ${response.status}`);
      }

      const payload = (await response.json()) as {
        images?: unknown[];
        mode?: 'base64' | 'url';
      };

      if (!payload.images || !Array.isArray(payload.images)) {
        throw new Error('HttpProvider response does not contain images[]');
      }

      const mode = payload.mode ?? this.config.mode;
      if (mode === 'base64') {
        return {
          mode: 'base64',
          images: normalizeBase64Images(payload.images)
        };
      }

      return {
        mode: 'url',
        images: normalizeUrlImages(payload.images)
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
