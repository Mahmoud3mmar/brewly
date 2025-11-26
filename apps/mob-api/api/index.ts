import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import { AppModule } from '../src/app/app.module';
import { AppConfig } from '@./config';

let cachedApp: express.Express;

async function createApp(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    logger: false,
  });

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app', { infer: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Vercel already routes through /api, so we don't need the global prefix here
  // The routes will be: /api/v1/auth/* (from ControllerDecorator)
  // app.setGlobalPrefix(appConfig.apiPrefix);

  await app.init();
  cachedApp = expressApp;

  return expressApp;
}

export default async function handler(req: express.Request, res: express.Response): Promise<void> {
  const app = await createApp();
  return new Promise<void>((resolve) => {
    // Use the Express app as a request handler
    (app as any)(req, res, () => {
      resolve();
    });
  });
}

