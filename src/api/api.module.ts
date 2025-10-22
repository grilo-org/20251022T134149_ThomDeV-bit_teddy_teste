import { DynamicModule, Module } from "@nestjs/common";
import { OPTIONS_TYPE } from "./api-module-definition";
import { UserController } from "./controllers/user/user.controller";
import { AuthController } from "./controllers/auth/auth.controller";
import { ShortyLinksController } from "./controllers/shorty-links/shorty-links.controller";

@Module({})
export class ApiModule {
    static register(options: typeof OPTIONS_TYPE): DynamicModule {
        return {
            module: ApiModule,
            global: true,
            controllers: [UserController,AuthController, ShortyLinksController],
            imports: [options.useCaseModule]
        }
    }

}
