import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthUsecase } from "./auth.use-case";
import { IUserRepository } from "../../domain/interfaces/IUserRepository.interface";
import { UserDto } from "../../api/dtos/user.dto";
import { compare } from "bcrypt";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

describe("AuthUsecase", () => {
  let authUsecase: AuthUsecase;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
    } as any;

    jwtService = {
      signAsync: jest.fn(),
    } as any;

    authUsecase = new AuthUsecase(userRepository, jwtService);

    process.env.JWT_EXPIRE_IN = "3600";
  });

  it("deve retornar o access_token e refresh_token ao fazer login com sucesso", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashed_password",
    };

    const userDto: UserDto = {
      email: "test@example.com",
      password: "plain_password",
    };

    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(true);
    (jwtService.signAsync as jest.Mock).mockResolvedValueOnce("access_token");
    (jwtService.signAsync as jest.Mock).mockResolvedValueOnce("refresh_token");

    const result = await authUsecase.login(userDto);

    expect(userRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(compare).toHaveBeenCalledWith("plain_password", "hashed_password");
    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);

    expect(result).toEqual({
      access_token: "access_token",
      refresh_token: "refresh_token",
      token_type: "Bearer",
      expires_in: 3600,
    });
  });

  it("deve lançar UnauthorizedException se o usuário não for encontrado", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    const userDto: UserDto = {
      email: "notfound@example.com",
      password: "123456",
    };

    await expect(authUsecase.login(userDto)).rejects.toThrow(
      new UnauthorizedException("Usuario invalido"),
    );

    expect(userRepository.findByEmail).toHaveBeenCalledWith("notfound@example.com");
  });

  it("deve lançar UnauthorizedException se a senha for inválida", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashed_password",
    };

    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(false);

    const userDto: UserDto = {
      email: "test@example.com",
      password: "wrong_password",
    };

    await expect(authUsecase.login(userDto)).rejects.toThrow(
      new UnauthorizedException("Email e senha incorretos."),
    );

    expect(compare).toHaveBeenCalledWith("wrong_password", "hashed_password");
  });
});
