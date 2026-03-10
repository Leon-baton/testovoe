import { UserResponseDto } from '@/modules/users/response';
import { ApiProperty } from '@nestjs/swagger';

export class ArticleResponseDto {
    @ApiProperty({
        description: 'Уникальный ID статьи',
        format: 'uuid',
    })
    id: string;

    @ApiProperty({
        description: 'Заголовок статьи',
        example: 'Введение в NestJS',
    })
    title: string;

    @ApiProperty({
        description: 'Описание статьи',
        example: 'Статья о чем то',
    })
    description: string;

    @ApiProperty({
        description: 'ID автора статьи',
        format: 'uuid',
    })
    authorId: string;

    @ApiProperty({
        description: 'Информация об авторе',
        type: () => UserResponseDto,
        required: false,
    })
    author?: UserResponseDto;

    @ApiProperty({
        description: 'Дата создания статьи',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Дата последнего обновления',
    })
    updatedAt: Date;
}
