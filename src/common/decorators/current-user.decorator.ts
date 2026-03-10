import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ICurrentUserPayload } from '../types';

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): ICurrentUserPayload => {
        const request = ctx.switchToHttp().getRequest();
        return request.user as ICurrentUserPayload;
    },
);
