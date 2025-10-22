import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ShortenUrlDto } from "../../api/dtos/shorty-links.dto";
import { Utils } from "../../common/utils/utils";
import { UserEntity } from "../../domain/entities/user.entity";
import type { IShortyLinkRepository } from "../../domain/interfaces/IShortyLinksRepository";
import { REPOSITORIES_TOKEN } from "../../infrastructure/database/repositories/repositories-tokens";
import { ShortLinkEntity } from "src/domain/entities/shorty-links.entity";

@Injectable()

export class ShortyLinksUsecase {
    constructor(
        @Inject(REPOSITORIES_TOKEN.SHORTY_LINKS_TOKEN)
        private readonly shortyLinksRepository: IShortyLinkRepository
    ) { }

    async create(shortenUrl: ShortenUrlDto, user: UserEntity): Promise<{
        id: number,
        slug: string,
        shortUrl: string
    }> {
        const slug = Utils.base62Slug()

        const existing = await this.shortyLinksRepository.getBySlug(slug);

        if (shortenUrl.alias) {
            const existingAlias = await this.shortyLinksRepository.getByAlias(shortenUrl.alias)

            if (existingAlias) throw new BadRequestException('Alias já existente, tente novamente.');
        }

        if (existing) throw new BadRequestException('Slug já existente, tente novamente.');

        const url = await this.shortyLinksRepository.create(shortenUrl, user, slug);

        return {
            id: url.id,
            slug: url.slug,
            shortUrl: `${process.env.BASE_URL}/${url.slug}`,
        };
    }

    async getByUser(userId: number) : Promise<ShortLinkEntity[]> {
        return this.shortyLinksRepository.getByUser(userId);
    }

    async getBySlug(slug: string) : Promise<ShortLinkEntity | null> {
        return this.shortyLinksRepository.getBySlug(slug);
    }

    async update(id: number, newUrl: ShortenUrlDto, userId: number): Promise<{
        id: number,
        slug: string,
        shortUrl: string
    }> {
        const url = await this.shortyLinksRepository.getById(id);

        if (!url) throw new NotFoundException('URL não encontrada');

        const slug = Utils.base62Slug()

        const existing = await this.shortyLinksRepository.getBySlug(slug);

        if (existing) throw new BadRequestException('Slug já existente, tente novamente.');

        if (newUrl.alias) {
            const existingAlias = await this.shortyLinksRepository.getByAlias(newUrl.alias)

            if (existingAlias) throw new BadRequestException('Alias já existente, tente novamente.');
        }

        if (url.owner?.id !== userId) throw new ForbiddenException('Você não pode editar esta URL');

        await this.shortyLinksRepository.update(id, url, newUrl, userId);

        return {
            id: url.id,
            slug: url.slug,
            shortUrl: `${process.env.BASE_URL}/${url.slug}`,
        };
    }

    async delete(id: number, userId: number): Promise<boolean> {
        const url = await this.shortyLinksRepository.getById(id);

        if (!url) throw new NotFoundException('URL não encontrada');

        if (url.owner?.id !== userId) throw new ForbiddenException('Você não pode deletar esta URL');

        return await this.shortyLinksRepository.delete(id);
    }

    async increment(id: number) {
        await this.shortyLinksRepository.incrementAccessCount(id)
    }
}

