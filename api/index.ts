// Root-level API handler for Vercel
// This file is in the root so Vercel can find dependencies in node_modules
// Register tsconfig-paths to resolve path aliases at runtime - MUST be first
// Use require to ensure it runs synchronously before any imports
// This must be in a try-catch because tsconfig-paths might not be available during initial compilation
(function registerPathAliases() {
  try {
    // Use require to ensure synchronous execution before any imports
    const tsconfigPaths = require('tsconfig-paths');
    const path = require('path');
    
    // Get the project root - in Vercel, __dirname is /var/task/api, so go up one level
    const projectRoot = path.resolve(__dirname, '..');
    
    tsconfigPaths.register({
      baseUrl: projectRoot,
      paths: {
        '@./auth': ['libs/auth/src/index.ts'],
        '@./auth/*': ['libs/auth/src/lib/*'],
        '@./common': ['libs/common/src/index.ts'],
        '@./common/*': ['libs/common/src/lib/*'],
        '@./config': ['libs/config/src/index.ts'],
        '@./config/*': ['libs/config/src/lib/*'],
        '@./contract': ['libs/contract/src/index.ts'],
        '@./contract/*': ['libs/contract/src/lib/*'],
        '@./database': ['libs/database/src/index.ts'],
        '@./database/*': ['libs/database/src/lib/*'],
        '@./logger': ['libs/logger/src/index.ts'],
        '@./logger/*': ['libs/logger/src/lib/*'],
        '@./mail': ['libs/mail/src/index.ts'],
        '@./mail/*': ['libs/mail/src/lib/*'],
        '@./user': ['libs/user/src/index.ts'],
        '@./user/*': ['libs/user/src/lib/*'],
      },
    });
    console.log('[api/index.ts] Path aliases registered successfully');
  } catch (error: any) {
    // If tsconfig-paths is not available, log but don't fail
    // This might happen during initial compilation
    console.warn('[api/index.ts] Failed to register tsconfig-paths:', error?.message || error);
    console.warn('[api/index.ts] Path aliases may not be resolved. Ensure tsconfig-paths is installed.');
  }
})();

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import express, { Request, Response } from 'express';
import { AppModule } from '../apps/mob-api/src/app/app.module';
import { AppConfig } from '../libs/config/src/lib/app.config.js';

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
    if (!(res as any).headersSent) {
      (res as any).status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

