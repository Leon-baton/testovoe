import { UserEntity } from '@/modules/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { v7 } from 'uuid';

@Entity('articles')
export class ArticleEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string = v7();

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'uuid' })
    authorId: string;

    @ManyToOne(() => UserEntity, (user) => user.articles, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'authorId' })
    author: UserEntity;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date | null;
}
