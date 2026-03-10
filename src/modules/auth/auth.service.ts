import { ICurrentUserPayload } from '@/common/types';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos';
import { LoginResponseDto, TokensResponseDto } from './responses/login.response';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async login({ email, password }: LoginDto): Promise<LoginResponseDto> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Некорректные email или пароль');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Некорректные email или пароль');
        }

        const tokens = await this.generateTokens(user);
        return {
            tokens,
            user,
        };
    }

    async refresh(refreshToken: string): Promise<TokensResponseDto> {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.getOrThrow('jwt.secret'),
            });
        } catch (error) {
            throw new UnauthorizedException('Неверный refresh токен');
        }

        const user = await this.usersService.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('Пользователь не найден');
        }

        if (user.tokenVersion !== payload.tokenVersion) {
            throw new UnauthorizedException('Токен недействителен');
        }

        this.logout(user.id);

        return await this.generateTokens(user);
    }

    async logout(userId: string): Promise<void> {
        await this.usersService.incrementTokenVersion(userId);
    }

    private async generateTokens(user: UserEntity): Promise<TokensResponseDto> {
        const payload: ICurrentUserPayload = {
            sub: user.id,
            email: user.email,
            tokenVersion: user.tokenVersion,
        };

        const jwtConfig = this.configService.get('jwt');

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: jwtConfig.accessToken.expiresIn,
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: jwtConfig.refreshToken.expiresIn,
        });

        return { accessToken, refreshToken };
    }
}
