import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import admin, { ServiceAccount } from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { AppModule } from './app.module';
import { env } from './shared/config/env';
import { ErrorResponseFilter } from './shared/filters/error-response.filter';

async function bootstrap() {
  const firebaseConfig = {
    apiKey: env.firebaseApiKey,
    authDomain: env.firebaseAuthDomain,
    projectId: env.firebaseProjectId,
    storageBucket: env.firebaseStorageBucket,
    messagingSenderId: env.firebaseMessagingSenderId,
    appId: env.firebaseAppId,
  };
  initializeApp(firebaseConfig);

  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(env.firebaseJsonSdk) as ServiceAccount,
    ),
    storageBucket: env.firebaseStorageBucket,
  });

  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ErrorResponseFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: '*',
  });
  app.enableShutdownHooks();
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
