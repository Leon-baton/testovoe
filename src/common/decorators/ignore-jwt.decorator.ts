import { SetMetadata } from '@nestjs/common';

export const IGNORE_JWT = 'ignorejwt';
export const IgnoreJWTToken = () => SetMetadata(IGNORE_JWT, true);
