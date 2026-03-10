import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesCacheService } from './articles-cache.service';
import { ArticlesRepository } from './articles.repository';
import { ArticlesService } from './articles.service';

describe('ArticlesService', () => {
    let service: ArticlesService;
    let repository: jest.Mocked<ArticlesRepository>;
    let cacheService: jest.Mocked<ArticlesCacheService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArticlesService,
                {
                    provide: ArticlesRepository,
                    useValue: {
                        createArticle: jest.fn(),
                        findArticleById: jest.fn(),
                        updateArticle: jest.fn(),
                        softDeleteArticle: jest.fn(),
                    },
                },
                {
                    provide: ArticlesCacheService,
                    useValue: {
                        getArticle: jest.fn(),
                        setArticle: jest.fn(),
                        invalidateAllLists: jest.fn(),
                        invalidateArticleRelatedCache: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ArticlesService>(ArticlesService);
        repository = module.get(ArticlesRepository);
        cacheService = module.get(ArticlesCacheService);
    });

    describe('findOne', () => {
        const articleId = 'uuid-123';
        const mockArticle = { id: articleId, title: 'Test' } as any;

        it('должен вернуть данные из кэша, если они там есть', async () => {
            cacheService.getArticle.mockResolvedValue(mockArticle);

            const result = await service.findOne(articleId);

            expect(result).toEqual(mockArticle);
            expect(repository.findArticleById).not.toHaveBeenCalled();
        });

        it('должен запросить БД и сохранить в кэш, если в кэше пусто', async () => {
            cacheService.getArticle.mockResolvedValue(null);
            repository.findArticleById.mockResolvedValue(mockArticle);

            const result = await service.findOne(articleId);

            expect(result).toEqual(mockArticle);
            expect(cacheService.setArticle).toHaveBeenCalledWith(mockArticle);
        });

        it('должен выбросить NotFoundException, если статьи нет в БД', async () => {
            cacheService.getArticle.mockResolvedValue(null);
            repository.findArticleById.mockResolvedValue(null);

            await expect(service.findOne(articleId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('должен создать статью и инвалидировать списки', async () => {
            const dto = { title: 'New', description: 'Desc' };
            const authorId = 'user-1';
            repository.createArticle.mockResolvedValue({ id: '1', ...dto } as any);

            await service.create(dto, authorId);

            expect(repository.createArticle).toHaveBeenCalled();
            expect(cacheService.invalidateAllLists).toHaveBeenCalled();
        });
    });
});
