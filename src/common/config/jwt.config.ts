import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET ?? 'secret',
    accessToken: {
        expiresIn: '15m',
    },
    refreshToken: {
        expiresIn: '7d',
    },
}));
