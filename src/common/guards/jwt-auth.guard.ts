import {
    applyDecorators,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { swagger } from '../constants';
import { IGNORE_JWT } from '../decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const ignoreJwt = this.reflector.getAllAndOverride<boolean>(
            IGNORE_JWT,
            [context.getHandler(), context.getClass()],
        );

        if (ignoreJwt) {
            return true;
        }

        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, _info: any) {
        if (err || !user) {
            throw err || new UnauthorizedException('Ошибка авторизации');
        }
        return user;
    }
}

// NOTE: декоратор для сокращения кода, если у нас большинство эндпоинтов защищены JWT
// применяет JwtAuthGuard и добавляет Swagger декораторы для авторизации
export function Auth() {
    return applyDecorators(UseGuards(JwtAuthGuard), (target: any) => {
        if (!target.prototype) {
            throw new Error('Декоратор Auth должен находится над классом!');
        }
        const propertyDescriptors = Object.getOwnPropertyDescriptors(
            target.prototype,
        );

        for (const [propertyKey, descriptor] of Object.entries(
            propertyDescriptors,
        )) {
            if (!descriptor?.value || propertyKey === 'constructor') continue;

            const IsIgnoreAccessToken = Reflect.getMetadata(
                IGNORE_JWT,
                target.prototype[propertyKey],
            );
            if (!IsIgnoreAccessToken) {
                ApiBearerAuth(swagger.ACCESS_TOKEN_KEY)(
                    target.prototype,
                    propertyKey,
                    descriptor,
                );
            }
        }

        return target;
    });
}
