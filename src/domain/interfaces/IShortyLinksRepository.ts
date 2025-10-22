import { ShortenUrlDto } from "src/api/dtos/shorty-links.dto";
import { UserDto } from "src/api/dtos/user.dto";
import { ShortLinkEntity } from "../entities/shorty-links.entity";

export interface IShortyLinkRepository {
    getByUser(id: number): Promise<ShortLinkEntity[]>

    getBySlug(slug: string): Promise<ShortLinkEntity | null>

    getById(id: number): Promise<ShortLinkEntity | null>

    create(shorty: ShortenUrlDto, owner: UserDto, slug: string): Promise<ShortLinkEntity>

    delete(id: number): Promise<boolean>

    update(id: number, currentUrl: ShortLinkEntity, newUrl: ShortenUrlDto, userId: number): Promise<ShortLinkEntity>

    incrementAccessCount(id: number): Promise<void>

    getByAlias(alias: string): Promise<ShortLinkEntity | null>
}
