import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {
    @ApiProperty({
        example: true,
        description: 'Флаг успешного выполнения операции',
    })
    success: boolean;
}
