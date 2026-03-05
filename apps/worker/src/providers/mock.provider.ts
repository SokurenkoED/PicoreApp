import sharp from 'sharp';
import type { ImageProvider, ProviderResult, GenerationRequest } from '@picoria/shared';

export class MockProvider implements ImageProvider {
  key = 'mock';

  async generate(request: GenerationRequest): Promise<ProviderResult> {
    const images = await Promise.all(
      Array.from({ length: request.outputCount }).map(async (_, index) => {
        const color = ['#1f2937', '#0f766e', '#be185d', '#1d4ed8', '#ca8a04', '#7c3aed'][index % 6];
        const text = `MOCK ${request.jobId} #${index + 1}`;
        const svg = `<svg width="1024" height="1280" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${color}" />
          <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="54" font-family="Arial" dy=".3em">${text}</text>
        </svg>`;
        const buffer = await sharp(Buffer.from(svg))
          .jpeg({ quality: 90 })
          .toBuffer();

        return {
          data: buffer.toString('base64'),
          mime: 'image/jpeg'
        };
      })
    );

    return {
      mode: 'base64',
      images
    };
  }
}
