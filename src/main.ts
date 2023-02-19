import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as morgan from 'morgan';
import helmet from 'helmet';

import { AppModule } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.prettyPrint(),
        winston.format.timestamp(),
        winston.format.ms(),
        utilities.format.nestLike('API'),
      ),
    }),
    cors: true,
  });
  const logger = new Logger();
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');
  const isDev = configService.get('NODE_ENV', 'production') === 'development';

  app.use(
    morgan(':remote-addr - :method :url :status', {
      stream: {
        write: (message) => logger.log(message.trim(), 'Request'),
      },
    }),
    helmet(
      isDev
        ? {
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false,
            crossOriginOpenerPolicy: false,
            crossOriginResourcePolicy: false,
          }
        : {},
    ),
  );

  if (isDev) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('DUCTIN API')
      .setDescription('DUCTIN API Swagger Documentation')
      .setVersion('1.0.0')
      .addBearerAuth({
        type: 'http',
        bearerFormat: 'JWT',
      })
      .addBearerAuth(
        {
          type: 'http',
          bearerFormat: 'JWT',
        },
        'refresh',
      )
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, swaggerDocument);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(PORT);
  logger.log(`listening at http://localhost:${PORT}/api`, 'Server');
}

bootstrap();
