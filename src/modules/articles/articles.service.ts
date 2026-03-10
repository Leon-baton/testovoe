import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticlesCacheService } from './articles-cache.service';
import { ArticlesRepository } from './articles.repository';
import { CreateArticleDto, FindArticlesDto, UpdateArticleDto } from './dtos';
import { ArticleEntity } from './entities';
import { FindArticlesResponseDto } from './responses/find-articles.response';

@Injectable()
export class ArticlesService {
    constructor(
        private readonly cacheService: ArticlesCacheService,
        private readonly articlesRepository: ArticlesRepository,
    ) {}

    async create(dto: CreateArticleDto, authorId: string): Promise<ArticleEntity> {
        const article = await this.articlesRepository.createArticle({ ...dto, authorId });
        await this.cacheService.invalidateAllLists();
        return article;
    }

    async findOne(id: string): Promise<ArticleEntity> {
        const cached = await this.cacheService.getArticle(id);
        if (cached) return cached;

        const article = await this.articlesRepository.findArticleById(id);
        if (!article) {
            throw new NotFoundException(`Статья с ID ${id} не найдена`);
        }

        await this.cacheService.setArticle(article);
        return article;
    }

    async update(id: string, updateData: UpdateArticleDto): Promise<ArticleEntity> {
        const article = await this.findOne(id);
        const updatedArticle = await this.articlesRepository.updateArticle(id, updateData);

        await this.cacheService.invalidateArticleRelatedCache(id, article.authorId);
        return updatedArticle;
    }

    async remove(id: string): Promise<void> {
        const article = await this.findOne(id);
        await this.articlesRepository.softDeleteArticle(id);

        await this.cacheService.invalidateArticleRelatedCache(id, article.authorId);
    }

    async findAll(query: FindArticlesDto): Promise<FindArticlesResponseDto> {
        const result = await this.articlesRepository.findAllWithFilters(query);
        return result;
    }
}
