import { Dtos } from '@/common';
import { SortOrder } from '@/common/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SortBy } from '../types';

export class FindArticlesDto extends Dtos.request.PaginationDto {
    @ApiProperty({
        description: 'Фильтр по автору',
        required: false,
    })
    @IsOptional()
    @IsUUID('all')
    authorId?: string;

    @ApiProperty({
        description: 'Поиск по заголовку',
        required: false,
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({
        description: 'Дата публикации от',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @ApiProperty({
        description: 'Дата публикации до',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    dateTo?: string;

    @ApiProperty({
        description: 'Поле для сортировки',
        enum: SortBy,
        required: false,
        default: SortBy.CREATED_AT,
    })
    @IsOptional()
    @IsEnum(SortBy)
    sortBy?: SortBy = SortBy.CREATED_AT;

    @ApiProperty({
        description: 'Порядок сортировки',
        enum: SortOrder,
        required: false,
        default: SortOrder.DESC,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;
}
