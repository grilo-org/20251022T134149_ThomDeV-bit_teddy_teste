import { UserDto } from "src/api/dtos/user.dto";
import { UserEntity } from "../entities/user.entity";

export interface IUserRepository {
    create(user: UserDto): Promise<boolean>
    findByEmail(email : string) : Promise<UserEntity | null>
}
