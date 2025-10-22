import { DataSourceOptions, DataSource } from 'typeorm';
import 'dotenv/config';
import { UserEntity } from '../../../domain/entities/user.entity';
import { ShortLinkEntity } from '../../../domain/entities/shorty-links.entity';
import { CreateTablesV11760933020165 } from '../migrations/1760933020165-create_tables_v1';

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_LOCAL_PORT),
    username:  process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    entities: [UserEntity, ShortLinkEntity],
    migrations: [CreateTablesV11760933020165],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
