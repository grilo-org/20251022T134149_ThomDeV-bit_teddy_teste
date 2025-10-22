import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserDto } from "src/api/dtos/user.dto";
import { UserEntity } from "src/domain/entities/user.entity";
import { Repository, ReturnDocument } from "typeorm";

@Injectable()


export class UserRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userEntity: Repository<UserEntity>
    ) { }


    async create(user: UserDto): Promise<boolean> {
        try {
            const newUser = this.userEntity.create(user)

            await this.userEntity.save(user)

            return true

        } catch (error) {
            throw new Error('DATABASE ERROR')
        }
    }

    async findByEmail(email : string) : Promise<UserEntity | null>{
        try {
            return await this.userEntity.findOneBy({email})
        } catch (error) {
            throw new Error("DATABASE ERROR")
        }
    }
}
