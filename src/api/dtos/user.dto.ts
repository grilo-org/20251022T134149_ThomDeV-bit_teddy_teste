import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, Length } from "class-validator";

export class UserDto {
    @ApiProperty()
    @IsEmail()
    email: string

    @ApiProperty()
    @Length(5, 50)
    password: string
}
