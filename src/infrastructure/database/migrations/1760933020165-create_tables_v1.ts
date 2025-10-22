import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTablesV11760933020165 implements MigrationInterface {
    name = 'CreateTablesV11760933020165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`short_links\` (\`id\` int NOT NULL AUTO_INCREMENT, \`original_url\` text NOT NULL, \`slug\` varchar(255) NOT NULL, \`alias\` varchar(255) NOT NULL, \`access_count\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`ownerId\` int NULL, UNIQUE INDEX \`IDX_25166d1fb9a2e96a1cf4e45f76\` (\`slug\`), UNIQUE INDEX \`IDX_ccf281ef3fa17d19847b0ed051\` (\`alias\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`short_links\` ADD CONSTRAINT \`FK_0fe67f684fe10262806ef727d20\` FOREIGN KEY (\`ownerId\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`short_links\` DROP FOREIGN KEY \`FK_0fe67f684fe10262806ef727d20\``);
        await queryRunner.query(`DROP INDEX \`IDX_ccf281ef3fa17d19847b0ed051\` ON \`short_links\``);
        await queryRunner.query(`DROP INDEX \`IDX_25166d1fb9a2e96a1cf4e45f76\` ON \`short_links\``);
        await queryRunner.query(`DROP TABLE \`short_links\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
