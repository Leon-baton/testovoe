import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'Email',
        format: 'email',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Пароль',
        minLength: 6,
        example: 'password123',
        format: 'password',
    })
    @IsString()
    @MinLength(6)
    password: string;
}
