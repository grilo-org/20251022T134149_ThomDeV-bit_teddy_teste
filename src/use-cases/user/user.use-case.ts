import { BadRequestException, ConflictException, Inject, Injectable, Type } from "@nestjs/common";
import { UserDto } from "src/api/dtos/user.dto";
import type { IUserRepository } from "src/domain/interfaces/IUserRepository.interface";
import { REPOSITORIES_TOKEN } from "src/infrastructure/database/repositories/repositories-tokens";
import bcrypt from 'bcrypt'
import { argsArgArrayOrObject } from "rxjs/internal/util/argsArgArrayOrObject";

@Injectable()


export class UserUsecase {
    constructor(
        @Inject(REPOSITORIES_TOKEN.USER_REPOSITORY_TOKEN)
        private readonly userRepository: IUserRepository,

    ) { }

    async createUser(user: UserDto): Promise<boolean> {
        try {
            const userExist = await this.userRepository.findByEmail(user.email)

            if(userExist) throw new ConflictException("Email já cadastrasdo.")

            user.password = await bcrypt.hash(user.password, 10)

            await this.userRepository.create(user)

            return true
        } catch (error) {
            throw error
        }
    }
}
