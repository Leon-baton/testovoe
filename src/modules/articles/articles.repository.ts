import { Injectable } from '@nestjs/common';
import { Between, DataSource, FindOptionsWhere, Like, Repository } from 'typeorm';
import { FindArticlesDto } from './dtos';
import { ArticleEntity } from './entities/article.entity';
import { FindArticlesResponseDto } from './responses';

@Injectable()
export class ArticlesRepository extends Repository<ArticleEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(ArticleEntity, dataSource.createEntityManager());
    }

    async createArticle(articleData: Partial<ArticleEntity>): Promise<ArticleEntity> {
        const article = this.create(articleData);
        return this.save(article);
    }

    async findArticleById(id: string): Promise<ArticleEntity | null> {
        return this.findOne({
            where: { id },
            relations: {
                author: true,
            },
            select: {
                author: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        });
    }

    async findAllWithFilters({
        page,
        limit,
        authorId,
        title,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
    }: FindArticlesDto): Promise<FindArticlesResponseDto> {
        const skip = (page - 1) * limit;

        const where: FindOptionsWhere<ArticleEntity> = {};

        if (authorId) {
            where.authorId = authorId;
        }

        if (title) {
            where.title = Like(`%${title}%`);
        }

        if (dateFrom && dateTo) {
            where.createdAt = Between(new Date(dateFrom), new Date(dateTo));
        }

        const [articles, total] = await this.findAndCount({
            where,
            relations: {
                author: true,
            },
            select: {
                author: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            skip,
            take: limit,
            order: {
                [sortBy]: sortOrder,
            },
        });

        return {
            data: articles,
            page,
            total,
        };
    }

    async updateArticle(id: string, updateData: Partial<ArticleEntity>): Promise<ArticleEntity> {
        await this.update(id, updateData);
        return this.findArticleById(id);
    }

    async softDeleteArticle(id: string): Promise<void> {
        await this.softDelete(id);
    }
}
