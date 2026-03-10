import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_KEY_METADATA } from '../decorators/cacheable.decorator';
import { RedisService } from '../modules/redis/redis.service';
import { ICacheableOptions } from '../types';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    constructor(
        private readonly redisService: RedisService,
        private readonly reflector: Reflector,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const cacheOptions = this.reflector.get<ICacheableOptions>(CACHE_KEY_METADATA, context.getHandler());

        if (!cacheOptions) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const cacheKey = this.generateCacheKey(cacheOptions, request.params, request.query);

        const cachedData = await this.redisService.get(cacheKey);
        if (cachedData) {
            return of(cachedData);
        }

        return next.handle().pipe(
            tap(async (data) => {
                if (data) {
                    const ttl = cacheOptions.ttl || 300;
                    await this.redisService.set(cacheKey, data, ttl);
                }
            }),
        );
    }

    private generateCacheKey(options: ICacheableOptions, params: any, query: any): string {
        if (options.keyGenerator) {
            return `${options.keyPrefix}:${options.keyGenerator(params, query)}`;
        }

        const paramsStr = Object.entries(params || {})
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}:${value}`)
            .join(':');

        const queryStr = Object.entries(query || {})
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}:${value}`)
            .join(':');

        return `${options.keyPrefix}:${paramsStr}:${queryStr}`.replace(/:+$/, '');
    }
}
