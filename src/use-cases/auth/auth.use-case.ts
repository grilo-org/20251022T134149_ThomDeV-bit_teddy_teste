import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { UserDto } from "../../api/dtos/user.dto";
import type { IUserRepository } from "../../domain/interfaces/IUserRepository.interface";
import { REPOSITORIES_TOKEN } from "../../infrastructure/database/repositories/repositories-tokens";
import 'dotenv/config';

@Injectable()

export class AuthUsecase {

    constructor(
        @Inject(REPOSITORIES_TOKEN.USER_REPOSITORY_TOKEN)
        private readonly userRepository: IUserRepository,
        private readonly jwtToken: JwtService
    ) { }

    async login(user: UserDto) {
        const userExist = await this.userRepository.findByEmail(user.email)

        if (!userExist) throw new UnauthorizedException('Usuario invalido')

        const validPassword = await compare(user.password, userExist.password)

        if (!validPassword) throw new UnauthorizedException("Email e senha incorretos.")

        const payload = { id: userExist.id, email: userExist.email }

        return {
            access_token: await this.jwtToken.signAsync(payload),
            refresh_token: await this.jwtToken.signAsync(payload, { expiresIn: Number(process.env.JWT_EXPIRE_IN) * 24 }),
            token_type: "Bearer",
            expires_in: Number(process.env.JWT_EXPIRE_IN)
        }
    }
}
