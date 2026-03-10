import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email пользователя',
    })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Иван', description: 'Имя пользователя' })
    @IsString()
    username: string;

    @ApiProperty({ example: 'password123', description: 'Пароль пользователя' })
    @IsString()
    password: string;
}
