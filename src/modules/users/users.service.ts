import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateMeDto } from './dtos';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
    constructor(private usersRepository: UsersRepository) {}

    async create({ email, username, password }: CreateUserDto): Promise<UserEntity> {
        const existingEmail = await this.usersRepository.findByEmail(email);
        if (existingEmail) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        const existingUsername = await this.usersRepository.findByUsername(username);
        if (existingUsername) {
            throw new ConflictException('Пользователь с таким username уже существует');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        return this.usersRepository.createUser({
            email,
            username,
            passwordHash: hashedPassword,
        });
    }

    async updateMe(userId: string, updateDto: UpdateMeDto): Promise<UserEntity> {
        const user = await this.findById(userId);

        if (updateDto.username && updateDto.username !== user.username) {
            const existingUsername = await this.usersRepository.findByUsername(updateDto.username);
            if (existingUsername) {
                throw new ConflictException('Пользователь с таким username уже существует');
            }
        }

        Object.assign(user, updateDto);
        return this.usersRepository.save(user);
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.usersRepository.findByEmail(email);
    }

    async findById(id: string): Promise<UserEntity> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`Пользователь с ID ${id} не найден`);
        }
        return user;
    }

    async incrementTokenVersion(userId: string): Promise<void> {
        await this.usersRepository.increment({ id: userId }, 'tokenVersion', 1);
    }
}
