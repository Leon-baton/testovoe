import { UserResponseDto } from '@/modules/users/response';
import { ApiProperty } from '@nestjs/swagger';

export class TokensResponseDto {
    @ApiProperty({
        description: 'Токен для доступов к апи',
    })
    accessToken: string;

    @ApiProperty({
        description: 'JWT токен для обновления access токена',
    })
    refreshToken: string;
}

export class LoginResponseDto {
    @ApiProperty({ type: () => TokensResponseDto })
    tokens: TokensResponseDto;

    @ApiProperty({ type: () => UserResponseDto })
    user: UserResponseDto;
}
