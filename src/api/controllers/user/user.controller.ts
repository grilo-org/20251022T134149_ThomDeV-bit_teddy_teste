import { Body, Controller, Post } from "@nestjs/common";
import { ApiProperty, ApiTags } from "@nestjs/swagger";
import { UserDto } from "../../dtos/user.dto";
import { UserUsecase } from "src/use-cases/user/user.use-case";

@ApiTags('user')
@Controller("user")
export class UserController {
    constructor(
        private readonly userUsecase: UserUsecase
    ) { }

    @ApiProperty({
        description: 'Endpoint para criação de usuarios.'
    })
    @Post("register")
    async create(@Body() user: UserDto): Promise<{message: string}> {
        try {
            await this.userUsecase.createUser(user)
            return {message: "Usuário criado com sucesso."}
        } catch (error) {
            throw error
        }
    }
}
