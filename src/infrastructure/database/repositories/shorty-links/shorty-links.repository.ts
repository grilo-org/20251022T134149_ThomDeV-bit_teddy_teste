import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NotFoundError } from "rxjs";
import { ShortenUrlDto } from "src/api/dtos/shorty-links.dto";
import { ShortLinkEntity } from "src/domain/entities/shorty-links.entity";
import { UserEntity } from "src/domain/entities/user.entity";
import { Repository, ReturnDocument } from "typeorm";

@Injectable()
export class ShortyLinkRepository {
    constructor(
        @InjectRepository(ShortLinkEntity)
        private readonly shortyLinkEntity: Repository<ShortLinkEntity>
    ) { }

    async getByUser(id: number): Promise<ShortLinkEntity[]> {
        return await this.shortyLinkEntity.find({ where: { owner: { id: id } } })
    }


    async getBySlug(slug: string): Promise<ShortLinkEntity | null> {
        return await this.shortyLinkEntity.findOne({ where: { slug }, withDeleted: true })
    }


    async getById(id: number): Promise<ShortLinkEntity | null> {
        return await this.shortyLinkEntity.findOne({
            where: { id }, relations: ['owner'], select: {
                owner: {
                    id: true
                }
            }
        })
    }

    async create(shorty: ShortenUrlDto, owner: UserEntity, slug: string): Promise<ShortLinkEntity> {
        try {
            const newShorty = this.shortyLinkEntity.create({
                ...shorty,
                slug,
                owner
            })

            await this.shortyLinkEntity.save(newShorty)

            return newShorty
        } catch (error) {
            throw new Error('DATABASE ERROR', error)
        }

    }

    async delete(id: number): Promise<boolean> {
        await this.shortyLinkEntity.softDelete(id)
        return true
    }


    async getByAlias(alias: string): Promise<ShortLinkEntity | null> {
        return await this.shortyLinkEntity.findOne({ where: { alias }, withDeleted: true })
    }

    async update(id: number, currentUrl: ShortLinkEntity, newUrl: ShortenUrlDto, userId: number): Promise<ShortLinkEntity> {
        const shortyUpdated = this.shortyLinkEntity.merge(currentUrl, {
            ...newUrl
        })

        await this.shortyLinkEntity.save(shortyUpdated)

        return shortyUpdated
    }

    async incrementAccessCount(id: number) {
        await this.shortyLinkEntity.increment({ id }, 'accessCount', 1);
    }
}
