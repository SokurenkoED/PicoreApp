import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StorageConfig {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean;
  publicBaseUrl?: string;
}

export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl?: string;

  constructor(config: StorageConfig) {
    this.bucket = config.bucket;
    this.publicBaseUrl = config.publicBaseUrl;
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
  }

  private toPublicUrl(url: string): string {
    if (!this.publicBaseUrl) {
      return url;
    }

    try {
      const signedUrl = new URL(url);
      const publicUrl = new URL(this.publicBaseUrl);

      signedUrl.protocol = publicUrl.protocol;
      signedUrl.host = publicUrl.host;

      const basePath = publicUrl.pathname && publicUrl.pathname !== '/'
        ? publicUrl.pathname.replace(/\/$/, '')
        : '';
      if (basePath) {
        signedUrl.pathname = `${basePath}${signedUrl.pathname}`;
      }

      return signedUrl.toString();
    } catch {
      return url;
    }
  }

  async presignPut(objectKey: string, ttlSeconds: number, contentType?: string): Promise<string> {
    const url = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        ContentType: contentType
      }),
      { expiresIn: ttlSeconds }
    );
    return this.toPublicUrl(url);
  }

  async presignGet(objectKey: string, ttlSeconds: number): Promise<string> {
    const url = await getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: objectKey
      }),
      { expiresIn: ttlSeconds }
    );
    return this.toPublicUrl(url);
  }

  async putObject(
    objectKey: string,
    body: Buffer,
    contentType: string,
    overrides?: Partial<PutObjectCommandInput>
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: body,
        ContentType: contentType,
        ...overrides
      })
    );
  }

  async getObject(objectKey: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: objectKey
      })
    );
    if (!response.Body) {
      throw new Error(`Empty object body: ${objectKey}`);
    }

    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}
