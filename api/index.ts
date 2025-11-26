// Root-level API handler for Vercel
// This file is in the root so Vercel can find dependencies in node_modules
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import express, { Request, Response } from 'express';
import { AppModule } from '../apps/mob-api/src/app/app.module';
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

  // Set global prefix - Vercel routes /api/* to handler with full path /api/...
  app.setGlobalPrefix(appConfig.apiPrefix);

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Brewly Mob-API')
    .setDescription('Brewly Mobile API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Swagger will be available at /api (matching global prefix)
  SwaggerModule.setup(appConfig.apiPrefix, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.init();
  cachedApp = expressApp;

  return expressApp;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    const app = await createApp();
    return new Promise<void>((resolve, reject) => {
      // Use the Express app as a request handler
      (app as any)(req, res, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      (res as Response).status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

