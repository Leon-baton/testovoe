import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({
        description: 'Уникальный ID пользователя',
        format: 'uuid',
    })
    id: string;

    @ApiProperty({
        description: 'Email пользователя',
        format: 'email',
    })
    email: string;

    @ApiProperty({
        example: 'Иван',
        description: 'Имя пользователя',
    })
    username: string;

    @ApiProperty({
        description: 'Дата создания профиля',
    })
    createdAt: Date;
}
