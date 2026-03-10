import { Decorators, Guards } from '@/common';
import { ICurrentUserPayload } from '@/common/types';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, UpdateMeDto } from './dtos';
import { UserResponseDto } from './response';
import { UsersService } from './users.service';

@ApiTags('Пользователи')
@Guards.Auth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiOperation({ summary: 'Регистрация нового пользователя' })
    @ApiOkResponse({ type: UserResponseDto })
    async create(@Body() registerDto: CreateUserDto) {
        return this.usersService.create(registerDto);
    }

    @Get('me')
    @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
    @ApiOkResponse({ type: UserResponseDto })
    async getMe(@Decorators.CurrentUser() user: ICurrentUserPayload) {
        return this.usersService.findById(user.sub);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Обновить профиль текущего пользователя' })
    @ApiOkResponse({ type: UserResponseDto })
    async updateMe(@Decorators.CurrentUser() user: ICurrentUserPayload, @Body() updateMeDto: UpdateMeDto) {
        return this.usersService.updateMe(user.sub, updateMeDto);
    }
}
