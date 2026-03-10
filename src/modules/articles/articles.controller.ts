import { Decorators, Dtos, Guards, Interceptors, Types } from '@/common';
import { Cacheable } from '@/common/decorators';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, FindArticlesDto, UpdateArticleDto } from './dtos';
import { ArticleResponseDto, FindArticlesResponseDto } from './responses';

@ApiTags('Статьи')
@Guards.Auth()
@UseInterceptors(Interceptors.CacheInterceptor)
@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) {}

    @Post()
    @ApiOperation({ summary: 'Создать новую статью' })
    @ApiOkResponse({ type: ArticleResponseDto })
    async create(
        @Decorators.CurrentUser() user: Types.ICurrentUserPayload,
        @Body() createArticleDto: CreateArticleDto,
    ) {
        return this.articlesService.create(createArticleDto, user.sub);
    }

    @Get()
    @Decorators.IgnoreJWTToken()
    @Cacheable({ keyPrefix: 'articles:list', ttl: 300 })
    @ApiOperation({ summary: 'Получить список статей' })
    @ApiOkResponse({ type: FindArticlesResponseDto })
    async findAll(@Query() query: FindArticlesDto) {
        return this.articlesService.findAll(query);
    }

    @Get(':id')
    @Decorators.IgnoreJWTToken()
    @ApiOperation({ summary: 'Получить статью по ID' })
    @ApiOkResponse({ type: ArticleResponseDto })
    async findOne(@Param('id') id: string) {
        return this.articlesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить статью' })
    @ApiOkResponse({ type: ArticleResponseDto })
    async update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
        return this.articlesService.update(id, updateArticleDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить статью' })
    @ApiOkResponse({ type: Dtos.response.SuccessResponseDto })
    async remove(@Param('id') id: string) {
        await this.articlesService.remove(id);
        return { success: true };
    }
}
