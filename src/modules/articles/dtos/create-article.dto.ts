import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateArticleDto {
    @ApiProperty({
        description: 'Заголовок статьи',
        example: 'Введение',
    })
    @IsString()
    @MaxLength(100)
    title: string;

    @ApiProperty({
        description: 'Описание статьи',
        example: 'Статья о чем то',
    })
    @IsString()
    @MaxLength(255)
    description: string;
}
