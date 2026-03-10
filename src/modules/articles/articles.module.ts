import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesCacheService } from './articles-cache.service';
import { ArticlesController } from './articles.controller';
import { ArticlesRepository } from './articles.repository';
import { ArticlesService } from './articles.service';
import { ArticleEntity } from './entities/article.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ArticleEntity])],
    controllers: [ArticlesController],
    providers: [ArticlesService, ArticlesRepository, ArticlesCacheService],
    exports: [ArticlesService],
})
export class ArticlesModule {}
