import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../libs/config/src/lib/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app', { infer: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

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
  SwaggerModule.setup(`${appConfig.apiPrefix}`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = appConfig.port;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/${appConfig.apiPrefix}`);
  console.log(`Swagger documentation: http://localhost:${port}/${appConfig.apiPrefix}`);
}

bootstrap();
