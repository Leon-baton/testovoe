import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersRepository extends Repository<UserEntity> {
    constructor(private dataSource: DataSource) {
        super(UserEntity, dataSource.createEntityManager());
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.findOne({ where: { email } });
    }

    async findByUsername(username: string): Promise<UserEntity | null> {
        return this.findOne({ where: { username } });
    }

    async createUser(userData: Partial<UserEntity>): Promise<UserEntity> {
        const user = this.create(userData);
        return this.save(user);
    }
}
