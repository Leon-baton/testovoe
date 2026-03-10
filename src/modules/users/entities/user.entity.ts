import { ArticleEntity } from '@/modules/articles/entities';
import { Exclude } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { v7 } from 'uuid';

@Entity('users')
export class UserEntity {
    @PrimaryColumn('uuid')
    id: string = v7();

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ length: 100 })
    username: string;

    @Column()
    @Exclude()
    passwordHash: string;

    @Column({ type: 'int', default: 0 })
    @Exclude()
    tokenVersion: number;

    @OneToMany(() => ArticleEntity, (article) => article.author)
    articles: ArticleEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
