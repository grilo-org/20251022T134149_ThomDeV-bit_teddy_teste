import { Test, TestingModule } from '@nestjs/testing';
import { ShortyLinksUsecase } from '../../../use-cases/shorty-links/shorty-links.use-case';
import { PinoLogger } from 'nestjs-pino';
import { BadRequestException } from '@nestjs/common';
import { ShortyLinksController } from './shorty-links.controller';
import { ShortLinkEntity } from '../../../domain/entities/shorty-links.entity';
import { JwtService } from '@nestjs/jwt';

describe('ShortyLinksController', () => {
    let controller: ShortyLinksController;
    let usecase: jest.Mocked<ShortyLinksUsecase>;
    let logger: jest.Mocked<PinoLogger>;
    let jwt: jest.Mocked<JwtService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShortyLinksController],
            providers: [
                {
                    provide: ShortyLinksUsecase,
                    useValue: {
                        create: jest.fn(),
                        getByUser: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        getBySlug: jest.fn(),
                        increment: jest.fn(),
                    },
                },
                {
                    provide: PinoLogger,
                    useValue: {
                        info: jest.fn(),
                        error: jest.fn(),
                    },
                },
                JwtService
            ],
        }).compile();

        controller = module.get<ShortyLinksController>(ShortyLinksController);
        usecase = module.get(ShortyLinksUsecase);
        logger = module.get(PinoLogger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockReq = {
        user: { id: 1, email: 'user@test.com' },
    } as any;

    describe('shorten', () => {
        it('deve criar uma nova url encurtada', async () => {
            const dto = { originalUrl: 'https://example.com' } as any;
            const mockResult = { id: 1, slug: 'abc123', ...dto };

            usecase.create.mockResolvedValue(mockResult);

            const result = await controller.shorten(dto, mockReq);

            expect(result).toEqual(mockResult);
            expect(usecase.create).toHaveBeenCalledWith(dto, mockReq.user);
            expect(logger.info).toHaveBeenCalledWith(
                `Nova url encurtada ${mockResult}`
            );
        });

        it('deve registrar erro e relançar exceção', async () => {
            const error = new Error('Erro ao criar URL');
            usecase.create.mockRejectedValue(error);

            await expect(controller.shorten({} as any, mockReq)).rejects.toThrow(error);
            expect(logger.error).toHaveBeenCalledWith('Erro ao criar URL');
        });
    });

    describe('listMyUrls', () => {
        it('deve listar urls do usuário', async () => {
            const urls: ShortLinkEntity[] = [{
                id: 1, slug: 'abc',
                originalUrl: '',
                alias: '',
                accessCount: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }];
            usecase.getByUser.mockResolvedValue(urls);

            const result = await controller.listMyUrls(mockReq);

            expect(result).toEqual(urls);
            expect(usecase.getByUser).toHaveBeenCalledWith(mockReq.user.id);
            expect(logger.info).toHaveBeenCalledWith(
                `Listando todas urls de ${mockReq.user.email}`
            );
        });
    });

    describe('update', () => {
        it('deve atualizar a url', async () => {
            const urls = {
                id: 0, slug: 'string', shortUrl: 'string'
            };

            usecase.update.mockResolvedValue(urls);

            const dto = { originalUrl: 'https://nova.com' } as any;
            const result = await controller.update(1, dto, mockReq);

            expect(result).toBe(true);
            expect(usecase.update).toHaveBeenCalledWith(1, dto, mockReq.user.id);
            expect(logger.info).toHaveBeenCalledWith(
                `Url alterada por ${mockReq.user.email}`
            );
        });
    });

    describe('delete', () => {
        it('deve deletar a url', async () => {
            usecase.delete.mockResolvedValue(true);

            const result = await controller.delete(1, mockReq);

            expect(result).toEqual({ message: 'URL deletada com sucesso' });
            expect(usecase.delete).toHaveBeenCalledWith(1, mockReq.user.id);
            expect(logger.info).toHaveBeenCalledWith(
                `Url deletada por ${mockReq.user.email}`
            );
        });
    });

    describe('redirect', () => {
        const mockRes = {
            redirect: jest.fn(),
        } as any;

        it('deve redirecionar para a URL original', async () => {
            const mockUrl: ShortLinkEntity = {
                id: 1, originalUrl: 'https://google.com', deletedAt: null,
                slug: '',
                alias: '',
                accessCount: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            usecase.getBySlug.mockResolvedValue(mockUrl);

            await controller.redirect('abc123', mockRes);

            expect(usecase.getBySlug).toHaveBeenCalledWith('abc123');
            expect(usecase.increment).toHaveBeenCalledWith(mockUrl.id);
            expect(mockRes.redirect).toHaveBeenCalledWith(mockUrl.originalUrl);
        });

        it('deve lançar erro se url não existir', async () => {
            usecase.getBySlug.mockResolvedValue(null);

            await expect(controller.redirect('abc123', mockRes)).rejects.toThrow(
                BadRequestException
            );
        });

        it('deve lançar erro se url estiver deletada', async () => {
            const mockUrl: ShortLinkEntity = {
                id: 1, originalUrl: 'https://google.com', deletedAt: new Date(),
                slug: '',
                alias: '',
                accessCount: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            usecase.getBySlug.mockResolvedValue(mockUrl);

            await expect(controller.redirect('abc123', mockRes)).rejects.toThrow(
                BadRequestException
            );
        });
    });
});
