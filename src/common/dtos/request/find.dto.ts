import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationDto {
    @ApiProperty({
        example: 1,
        description: 'Номер страницы',
    })
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    page: number;

    @ApiProperty({
        example: 10,
        description: 'Количество элементов на странице',
    })
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @Max(100)
    limit: number;
}

export class CursorPaginationDto {
    @ApiProperty({
        description: 'Курсор для пагинации (ID последнего элемента)',
        format: 'uuid',
        required: false,
    })
    @IsOptional()
    @IsString()
    cursor?: string;

    @ApiProperty({
        description: 'Количество элементов на страницу',
        minimum: 1,
        maximum: 100,
        default: 10,
        required: false,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 10;
}
