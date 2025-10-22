import { ConfigurableModuleBuilder, DynamicModule } from "@nestjs/common";

export interface ModuleOptions {
    useCaseModule: DynamicModule
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } = new ConfigurableModuleBuilder<ModuleOptions>().build()
