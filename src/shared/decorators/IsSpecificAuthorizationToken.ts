import { SetMetadata } from '@nestjs/common';

export const IS_SPECIFIC_TOKEN_KEY = 'IS_SPECIFIC_TOKEN';
export const IsSpecificAuthorizationToken = (token: string) =>
  SetMetadata(IS_SPECIFIC_TOKEN_KEY, token);
