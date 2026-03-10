import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto {
    @ApiProperty({
        description: 'Общее количество элементов',
        example: 100,
    })
    total: number;

    @ApiProperty({
        description: 'Текущая страница',
        example: 1,
    })
    page: number;
}

export class CursorPaginationResponse {
    @ApiProperty({
        description: 'Курсор для следующей страницы (ID последнего элемента)',
        nullable: true,
    })
    nextCursor: string | null;

    @ApiProperty({ description: 'Есть ли следующая страница', example: true })
    hasNextPage: boolean;
}
