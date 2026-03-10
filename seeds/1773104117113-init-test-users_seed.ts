import * as bcrypt from 'bcrypt';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

const USERS = [
    {
        id: uuidv7(),
        email: 'user@example.com',
        username: 'user_test',
        password: 'password123',
    },
];

export class InitTestUsersSeed1773104117113 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!USERS?.length) {
            return;
        }

        const passwordHashes = await Promise.all(USERS.map((user) => bcrypt.hash(user.password, 10)));

        let paramIndex = 1;
        const params: any[] = [];

        const values = USERS.map((user, index) => {
            const emailParam = `$${paramIndex++}`;
            const passwordParam = `$${paramIndex++}`;
            const usernameParam = `$${paramIndex++}`;

            params.push(user.email, passwordHashes[index], user.username);

            return `('${user.id}', ${emailParam}, ${passwordParam}, ${usernameParam}, 0, NOW(), NOW())`;
        }).join(', ');

        await queryRunner.query(
            `
                INSERT INTO users (id, email, "passwordHash", username, "tokenVersion", "createdAt", "updatedAt")
                VALUES ${values}
                ON CONFLICT (email) DO NOTHING;
            `,
            params,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const emails = USERS.map((user) => `'${user.email}'`).join(', ');

        if (emails.length > 0) {
            await queryRunner.query(`
                DELETE FROM users
                WHERE email IN (${emails});
            `);
        }
    }
}
