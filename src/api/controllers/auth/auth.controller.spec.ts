import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthUsecase } from '../../../use-cases/auth/auth.use-case';
import { PinoLogger } from 'nestjs-pino';

describe('AuthController', () => {
    let controller: AuthController;
    let usecase: jest.Mocked<AuthUsecase>;
    let logger: jest.Mocked<PinoLogger>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthUsecase,
                    useValue: {
                        login: jest.fn(),
                    },
                },
                {
                    provide: PinoLogger,
                    useValue: {
                        info: jest.fn(),
                        error: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        usecase = module.get(AuthUsecase);
        logger = module.get(PinoLogger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        const mockReq = {} as any;
        const mockUser = { email: 'user@test.com', password: '123456' };

        it('deve autenticar o usuário e retornar os dados', async () => {
            const mockResult = {
                access_token: 'access_token',
                refresh_token: 'refresh_token',
                token_type: "Bearer",
                expires_in: 3000
            };
            usecase.login.mockResolvedValue(mockResult);

            const result = await controller.login(mockUser, mockReq);

            expect(result).toEqual(mockResult);
            expect(mockReq.user).toEqual(mockResult);
            expect(usecase.login).toHaveBeenCalledWith(mockUser);
            expect(logger.info).toHaveBeenCalledWith(`Novo acesso de ${mockUser.email}`);
        });

        it('deve registrar erro e relançar exceção', async () => {
            const error = new Error('Credenciais inválidas');
            usecase.login.mockRejectedValue(error);

            await expect(controller.login(mockUser, mockReq)).rejects.toThrow(error);
            expect(logger.error).toHaveBeenCalledWith('Credenciais inválidas');
        });
    });
});
