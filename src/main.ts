import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import admin, { ServiceAccount } from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import serviceAccount from '../constalent-sdk.json';
import { AppModule } from './app.module';
import { ErrorResponseFilter } from './shared/filters/error-response.filter';

async function bootstrap() {
  const firebaseConfig = {
    apiKey: 'AIzaSyD2_xZcROy5PmjAjLD1ggHmosoX0sGaqGg',
    authDomain: 'constalent-35e52.firebaseapp.com',
    projectId: 'constalent-35e52',
    storageBucket: 'constalent-35e52.appspot.com',
    messagingSenderId: '924894933881',
    appId: '1:924894933881:web:02c847e8a157f3261e35a8',
  };
  initializeApp(firebaseConfig);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
    storageBucket: 'constalent-35e52.appspot.com',
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
