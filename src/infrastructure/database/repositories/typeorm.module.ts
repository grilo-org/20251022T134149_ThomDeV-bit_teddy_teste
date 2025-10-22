import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../config/database.config';
import { UserEntity } from 'src/domain/entities/user.entity';
import { OPTIONS_TYPE } from './typeorm-module-definition';
import { REPOSITORIES_TOKEN } from './repositories-tokens';
import { ShortLinkEntity } from 'src/domain/entities/shorty-links.entity';

@Module({})
export class TypeormModule {
    static register(options: typeof OPTIONS_TYPE): DynamicModule {
        const entitiesSchema = [UserEntity , ShortLinkEntity];
        const config = dataSourceOptions;
        return {
            module: TypeormModule,
            global: true,
            imports: [
                TypeOrmModule.forFeature(entitiesSchema),
                TypeOrmModule.forRootAsync({
                    useFactory: async () => {
                        return {
                            autoLoadEntities: true,
                            ...config,
                        };
                    },
                }),
            ],
            exports: [REPOSITORIES_TOKEN.USER_REPOSITORY_TOKEN, REPOSITORIES_TOKEN.SHORTY_LINKS_TOKEN],
            providers: [
                {
                    provide: REPOSITORIES_TOKEN.USER_REPOSITORY_TOKEN,
                    useClass: options.userRepository
                },
                {
                    provide: REPOSITORIES_TOKEN.SHORTY_LINKS_TOKEN,
                    useClass: options.shortyLinkRepository
                }
            ],
        };
    }
}
