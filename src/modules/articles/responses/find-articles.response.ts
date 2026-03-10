import { PaginationResponseDto } from '@/common/dtos/response';
import { ApiProperty } from '@nestjs/swagger';
import { ArticleResponseDto } from './article.response';

export class FindArticlesResponseDto extends PaginationResponseDto {
    @ApiProperty({
        description: 'Список статей',
        type: () => [ArticleResponseDto],
    })
    data: ArticleResponseDto[];
}
