import { Test, TestingModule } from '@nestjs/testing';
import { ShortyLinksUsecase } from './shorty-links.use-case';
import { REPOSITORIES_TOKEN } from '../../infrastructure/database/repositories/repositories-tokens';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Utils } from '../../common/utils/utils';
import { UserEntity } from 'src/domain/entities/user.entity';
import { ShortenUrlDto } from 'src/api/dtos/shorty-links.dto';

describe('ShortyLinksUsecase', () => {
    let usecase: ShortyLinksUsecase;
    let repository: jest.Mocked<any>;

    beforeEach(async () => {
        repository = {
            getBySlug: jest.fn(),
            getByAlias: jest.fn(),
            getByUser: jest.fn(),
            getById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            incrementAccessCount: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShortyLinksUsecase,
                {
                    provide: REPOSITORIES_TOKEN.SHORTY_LINKS_TOKEN,
                    useValue: repository,
                },
            ],
        }).compile();

        usecase = module.get(ShortyLinksUsecase);

        jest.spyOn(Utils, 'base62Slug').mockReturnValue('abc123');
        process.env.BASE_URL = 'http://localhost:3000';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockUser: UserEntity = {
        id: 1, email: 'user@test.com',
        password: '',
        createdAt: new Date(),
        updatedAt: new Date()
    };


    // CREATE
    // -----------------------------------
    describe('create', () => {
        it('deve criar uma nova URL encurtada com sucesso', async () => {
            repository.getBySlug.mockResolvedValue(null);
            repository.getByAlias.mockResolvedValue(null);
            repository.create.mockResolvedValue({
                id: 1,
                slug: 'abc123',
            });

            const dto = { originalUrl: 'https://google.com' } as any;

            const result = await usecase.create(dto, mockUser);

            expect(repository.getBySlug).toHaveBeenCalledWith('abc123');
            expect(repository.create).toHaveBeenCalledWith(dto, mockUser, 'abc123');
            expect(result).toEqual({
                id: 1,
                slug: 'abc123',
                shortUrl: 'http://localhost:3000/abc123',
            });
        });

        it('deve lançar erro se slug já existir', async () => {
            repository.getBySlug.mockResolvedValue({ id: 99 });

            await expect(
                usecase.create({ originalUrl: 'https://google.com' } as any, mockUser)
            ).rejects.toThrow(BadRequestException);
        });

        it('deve lançar erro se alias já existir', async () => {
            repository.getBySlug.mockResolvedValue(null);
            repository.getByAlias.mockResolvedValue({ id: 99 });

            await expect(
                usecase.create({ originalUrl: 'x', alias: 'teste' } as any, mockUser)
            ).rejects.toThrow('Alias já existente, tente novamente.');
        });
    });


    describe('getByUser', () => {
        it('deve retornar URLs do usuário', async () => {
            const urls = [{ id: 1 }];
            repository.getByUser.mockResolvedValue(urls);

            const result = await usecase.getByUser(1);

            expect(result).toEqual(urls);
            expect(repository.getByUser).toHaveBeenCalledWith(1);
        });
    });

    describe('getBySlug', () => {
        it('deve retornar URL pelo slug', async () => {
            const url = { id: 1, slug: 'abc123' };

            repository.getBySlug.mockResolvedValue(url);

            const result = await usecase.getBySlug('abc123');

            expect(result).toEqual(url);
        });
    });


    describe('update', () => {
        it('deve atualizar a URL com sucesso', async () => {
            const mockUrl = {
              id: 1,
              slug: 'abc123',
              owner: { id: 1 },
            };

            const dto: ShortenUrlDto = {
              originalUrl: 'https://nova.com',
              alias: 'abc123',
            };

            repository.getById.mockResolvedValue(mockUrl);
            repository.getBySlug.mockResolvedValue(null);
            repository.getByAlias.mockResolvedValue(null);
            repository.update.mockResolvedValue(undefined); 

            const result = await usecase.update(1, dto, 1);

            expect(result).toEqual({
              id: 1,
              slug: 'abc123',
              shortUrl: 'http://localhost:3000/abc123',
            });

            expect(repository.getById).toHaveBeenCalledWith(1);
            expect(repository.getBySlug).toHaveBeenCalled();
            expect(repository.getByAlias).toHaveBeenCalled();
            expect(repository.update).toHaveBeenCalledWith(1, mockUrl, dto, 1);
          });

        it('deve lançar NotFoundException se URL não existir', async () => {
            repository.getById.mockResolvedValue(null);

            await expect(usecase.update(1, {} as any, 1)).rejects.toThrow(NotFoundException);
        });

        it('deve lançar BadRequestException se slug já existir', async () => {
            repository.getById.mockResolvedValue({ id: 1, owner: { id: 1 } });
            repository.getBySlug.mockResolvedValue({ id: 2 });

            await expect(usecase.update(1, {} as any, 1)).rejects.toThrow(BadRequestException);
        });

        it('deve lançar BadRequestException se alias já existir', async () => {
            repository.getById.mockResolvedValue({ id: 1, owner: { id: 1 } });
            repository.getBySlug.mockResolvedValue(null);
            repository.getByAlias.mockResolvedValue({ id: 2 });

            await expect(
                usecase.update(1, { alias: 'teste' } as any, 1)
            ).rejects.toThrow('Alias já existente, tente novamente.');
        });

        it('deve lançar ForbiddenException se usuário não for dono da URL', async () => {
            repository.getById.mockResolvedValue({ id: 1, owner: { id: 999 } });
            repository.getBySlug.mockResolvedValue(null);
            repository.getByAlias.mockResolvedValue(null);

            await expect(usecase.update(1, {} as any, 1)).rejects.toThrow(ForbiddenException);
        });
    });


    describe('delete', () => {
        it('deve deletar URL com sucesso', async () => {
            repository.getById.mockResolvedValue({ id: 1, owner: { id: 1 } });
            repository.delete.mockResolvedValue(true);

            const result = await usecase.delete(1, 1);

            expect(result).toBe(true);
            expect(repository.delete).toHaveBeenCalledWith(1);
        });

        it('deve lançar NotFoundException se URL não existir', async () => {
            repository.getById.mockResolvedValue(null);

            await expect(usecase.delete(1, 1)).rejects.toThrow(NotFoundException);
        });

        it('deve lançar ForbiddenException se usuário não for dono da URL', async () => {
            repository.getById.mockResolvedValue({ id: 1, owner: { id: 2 } });

            await expect(usecase.delete(1, 1)).rejects.toThrow(ForbiddenException);
        });
    });


    describe('increment', () => {
        it('deve chamar o repositório para incrementar acessos', async () => {
            await usecase.increment(1);

            expect(repository.incrementAccessCount).toHaveBeenCalledWith(1);
        });
    });
});
