import { ConfigurableModuleBuilder, Type } from "@nestjs/common";
import { IShortyLinkRepository } from "src/domain/interfaces/IShortyLinksRepository";
import { IUserRepository } from "src/domain/interfaces/IUserRepository.interface";

export interface ModuleOptions {
    userRepository: Type<IUserRepository>;
    shortyLinkRepository :  Type<IShortyLinkRepository>;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<ModuleOptions>().build();
