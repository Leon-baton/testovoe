import { Guards, Types } from '@/common';
import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos';
import { RefreshDto } from './dtos/refresh.dto';
import { LoginResponseDto } from './responses/login.response';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Вход в систему' })
    @ApiOkResponse({ type: LoginResponseDto })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Обновление токенов',
        description: 'Обновление access и refresh токенов',
    })
    @ApiOkResponse({ description: 'Токены успешно обновлены' })
    async refresh(@Body() refreshDto: RefreshDto) {
        return this.authService.refresh(refreshDto.refreshToken);
    }

    @Post('logout')
    @UseGuards(Guards.JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Выход из системы' })
    async logout(@Req() req: Request & { user: Types.ICurrentUserPayload }): Promise<void> {
        return this.authService.logout(req.user.sub);
    }
}
