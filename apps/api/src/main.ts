import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import cookie from '@fastify/cookie';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true })
  );

  await app.register(cookie as any, {
    secret: process.env.JWT_SECRET ?? 'dev-secret'
  });

  app.enableCors({
    origin: true,
    credentials: true
  });

  const port = Number.parseInt(process.env.API_PORT ?? '3001', 10);
  await app.listen(port, '0.0.0.0');
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
