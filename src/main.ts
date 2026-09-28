import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'chrome-extension://*',  // Allow your Chrome extension
    ],
    credentials: true,
  });

  // Auto-validate all DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT || 3001);
  console.log(`ContextIQ API running on: ${await app.getUrl()}`);
}
bootstrap();