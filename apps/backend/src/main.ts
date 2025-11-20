import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  Logger,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as path from 'path';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SuccessResponseInterceptor } from './interceptor/success-response.interceptor';
import { extractAllErrors } from './helper/validation';
import { determineSourcePath } from './helper/common';
import { randomUUID } from 'crypto';
import { SeedersService } from './seeders/seeders.service';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'], // Enable all logs
  });

  const bootstrapLogger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  //seed
  const seederService = app.get(SeedersService);

  try {
    bootstrapLogger.log('Starting database seeding process...');
    await seederService.seed();
    bootstrapLogger.log('Database seeding process completed successfully.');
  } catch (error) {
    bootstrapLogger.error(
      'Error during database seeding:',
      error.stack || error,
    );
  }
  if (!(global as any).crypto) {
    (global as any).crypto = { randomUUID };
  }
  // Use cookie-parser middleware
  app.use(cookieParser());
  // Allow static assets
  app.useStaticAssets(
    'storage/' + path.join(process.cwd(), determineSourcePath(), `storage/app`),
  );
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('TASK API')
      .setDescription('TASK API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors) => {
        const errors = validationErrors.map((value) => {
          return extractAllErrors(value);
        });
        return new UnprocessableEntityException(...errors);
      },
    }),
  );

  //Interceptors
  app.useGlobalInterceptors(new SuccessResponseInterceptor());

  const port = configService.get<number>('port') ?? 3001;

  app.enableCors({
    origin: true, // allow all origins (you can specify a specific origin if needed)
    credentials: true, // allow credentials (cookies) to be sent
  });

  if (process.env.NODE_ENV !== 'test') {
    await app.listen(port);
  }

  // Development hot reload
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
