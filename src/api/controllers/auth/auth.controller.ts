import { Body, Controller, Post, Request } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { UserDto } from "../../dtos/user.dto"
import { AuthUsecase } from "../../../use-cases/auth/auth.use-case"
import { PinoLogger } from "nestjs-pino"

@Controller('auth')
@ApiTags('auth')

export class AuthController {
    constructor(
        private readonly authUsecase: AuthUsecase,
        private readonly logger: PinoLogger
    ) { }

    @Post('login')
    async login(@Body() user: UserDto, @Request() req) {
        try {
            req.user = await this.authUsecase.login(user)
            this.logger.info(`Novo acesso de ${user.email}`)
            return req.user
        } catch (error) {
            this.logger.error(`${error?.message}`)
            throw error;
        }
    }
}
