import { RedisService } from '@/common/modules/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { ArticleEntity } from './entities/article.entity';
import { FindArticlesResponseDto } from './responses/find-articles.response';

@Injectable()
export class ArticlesCacheService {
    private readonly logger = new Logger(ArticlesCacheService.name);

    private readonly ARTICLE_KEY_PREFIX = 'article';
    private readonly ARTICLES_LIST_PREFIX = 'articles:list';
    private readonly AUTHOR_ARTICLES_PREFIX = 'articles:author';

    // NOTE: 1 час для одной статьи
    // NOTE: 5 минут для списков
    // NOTE: 10 минут для статей автора
    private readonly ARTICLE_TTL = 3600;
    private readonly LIST_TTL = 300;
    private readonly AUTHOR_LIST_TTL = 600;

    constructor(private readonly redisService: RedisService) {}

    async getArticle(id: string): Promise<ArticleEntity | null> {
        const key = this.buildArticleKey(id);
        return this.redisService.get<ArticleEntity>(key);
    }

    async setArticle(article: ArticleEntity): Promise<void> {
        const key = this.buildArticleKey(article.id);
        await this.redisService.set(key, article, this.ARTICLE_TTL);
    }

    async deleteArticle(id: string): Promise<void> {
        const key = this.buildArticleKey(id);
        await this.redisService.del(key);
    }

    async getArticlesList(queryKey: string): Promise<FindArticlesResponseDto | null> {
        const key = this.buildListKey(queryKey);
        return this.redisService.get<FindArticlesResponseDto>(key);
    }

    async setArticlesList(queryKey: string, data: FindArticlesResponseDto): Promise<void> {
        const key = this.buildListKey(queryKey);
        await this.redisService.set(key, data, this.LIST_TTL);
    }

    async invalidateAllLists(): Promise<void> {
        await this.redisService.delPattern(`${this.ARTICLES_LIST_PREFIX}:*`);
        this.logger.log('Invalidated all articles lists cache');
    }

    async getAuthorArticles(authorId: string): Promise<ArticleEntity[] | null> {
        const key = this.buildAuthorArticlesKey(authorId);
        return this.redisService.get<ArticleEntity[]>(key);
    }

    async setAuthorArticles(authorId: string, articles: ArticleEntity[]): Promise<void> {
        const key = this.buildAuthorArticlesKey(authorId);
        await this.redisService.set(key, articles, this.AUTHOR_LIST_TTL);
    }

    async invalidateAuthorArticles(authorId: string): Promise<void> {
        const key = this.buildAuthorArticlesKey(authorId);
        await this.redisService.del(key);
    }

    async invalidateArticleRelatedCache(articleId: string, authorId?: string): Promise<void> {
        const tasks: Promise<any>[] = [this.deleteArticle(articleId), this.invalidateAllLists()];

        if (authorId) {
            tasks.push(this.invalidateAuthorArticles(authorId));
        }

        await Promise.all(tasks);
        this.logger.debug(`Full cache invalidation for article ${articleId}`);
    }

    private buildArticleKey(id: string): string {
        return `${this.ARTICLE_KEY_PREFIX}:${id}`;
    }

    private buildListKey(queryKey: string): string {
        return `${this.ARTICLES_LIST_PREFIX}:${queryKey}`;
    }

    private buildAuthorArticlesKey(authorId: string): string {
        return `${this.AUTHOR_ARTICLES_PREFIX}:${authorId}`;
    }
}
