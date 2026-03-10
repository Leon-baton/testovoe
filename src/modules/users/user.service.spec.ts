import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

jest.mock('bcrypt');

describe('UsersService', () => {
    let service: UsersService;
    let repository: jest.Mocked<UsersRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: UsersRepository,
                    useValue: {
                        findByEmail: jest.fn(),
                        findByUsername: jest.fn(),
                        createUser: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        increment: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get(UsersRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        const dto = { email: 'test@test.com', username: 'testuser', password: 'password123' };

        it('должен успешно создать пользователя', async () => {
            repository.findByEmail.mockResolvedValue(null);
            repository.findByUsername.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

            const expectedUser = { id: '1', ...dto, passwordHash: 'hashedPassword' } as any;
            repository.createUser.mockResolvedValue(expectedUser);

            const result = await service.create(dto);

            expect(result).toEqual(expectedUser);
            expect(repository.createUser).toHaveBeenCalledWith({
                email: dto.email,
                username: dto.username,
                passwordHash: 'hashedPassword',
            });
        });

        it('должен выбросить ConflictException, если email уже существует', async () => {
            repository.findByEmail.mockResolvedValue({ id: '1' } as any);

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
            expect(repository.findByEmail).toHaveBeenCalledWith(dto.email);
            expect(repository.createUser).not.toHaveBeenCalled();
        });

        it('должен выбросить ConflictException, если username уже существует', async () => {
            repository.findByEmail.mockResolvedValue(null);
            repository.findByUsername.mockResolvedValue({ id: '1' } as any);

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
            expect(repository.findByUsername).toHaveBeenCalledWith(dto.username);
            expect(repository.createUser).not.toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('должен вернуть пользователя, если он найден', async () => {
            const mockUser = { id: '1', username: 'test' } as any;
            repository.findOne.mockResolvedValue(mockUser);

            const result = await service.findById('1');
            expect(result).toEqual(mockUser);
            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
        });

        it('должен выбросить NotFoundException, если пользователь не найден', async () => {
            repository.findOne.mockResolvedValue(null);

            await expect(service.findById('1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateMe', () => {
        const mockUser = { id: '1', username: 'oldName' } as any;

        it('должен успешно обновить данные пользователя', async () => {
            repository.findOne.mockResolvedValue(mockUser);
            repository.findByUsername.mockResolvedValue(null);
            repository.save.mockResolvedValue({ ...mockUser, username: 'newName' } as any);

            const result = await service.updateMe('1', { username: 'newName' });

            expect(result.username).toBe('newName');
            expect(repository.save).toHaveBeenCalled();
        });

        it('должен выбросить ConflictException, если новый username уже занят', async () => {
            repository.findOne.mockResolvedValue({
                id: '1',
                username: 'oldName',
            } as any);

            repository.findByUsername.mockResolvedValue({
                id: '2',
                username: 'newName',
            } as any);

            await expect(service.updateMe('1', { username: 'newName' })).rejects.toThrow(ConflictException);

            expect(repository.findByUsername).toHaveBeenCalledWith('newName');
        });
    });
});
