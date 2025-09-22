import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString, NotEquals, validateSync } from 'class-validator';

class Env {
  @IsString()
  @IsNotEmpty()
  @NotEquals('mongodb://root:root@localhost:27017/constalent')
  dbURL: string;

  @IsString()
  @IsNotEmpty()
  @NotEquals('unsecure_jwt_secret')
  jwtSecret: string;

  @IsString()
  @IsNotEmpty()
  @NotEquals('firebaseApiKey')
  firebaseApiKey: string;

  @IsString()
  @IsNotEmpty()
  @NotEquals('firebaseAuthDomain')
  firebaseAuthDomain: string;

  @IsString()
  @IsNotEmpty()
  @NotEquals('firebaseProjectId')
  firebaseProjectId: string;

  @IsString()
  @IsNotEmpty()
  @NotEquals('firebaseStorageBucket')
  firebaseStorageBucket: string;

  @IsString()
  @IsNotEmpty()
  @NotEquals('firebaseMessagingSenderId')
  firebaseMessagingSenderId: string;

  @IsString()
  @IsNotEmpty()
  @NotEquals('firebaseAppId')
  firebaseAppId: string;

  @IsString()
  @IsNotEmpty()
  @NotEquals('firebaseJsonSdk')
  firebaseJsonSdk: string;
}

export const env: Env = plainToInstance(Env, {
  jwtSecret: process.env.JWT_SECRET,
  dbURL: process.env.DATABASE_URL,
  firebaseApiKey: process.env.FIREBASE_API_KEY,
  firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  firebaseAppId: process.env.FIREBASE_APP_ID,
  firebaseJsonSdk: process.env.FIREBASE_JSON_SDK,
});

const errors = validateSync(env);

if (errors.length > 0) {
  throw new Error(JSON.stringify(errors, null, 2));
}
