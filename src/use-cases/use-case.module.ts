import { DynamicModule, Module } from '@nestjs/common';
import { UserUsecase } from './user/user.use-case';
import { AuthUsecase } from './auth/auth.use-case';
import { ShortyLinksUsecase } from './shorty-links/shorty-links.use-case';


@Module({})
export class UseCaseModule {
    static register(): DynamicModule {
        return {
            module: UseCaseModule,
            global: true,
            providers: [UserUsecase, AuthUsecase, ShortyLinksUsecase],
            exports: [UserUsecase, AuthUsecase, ShortyLinksUsecase]
        };
    }
}
