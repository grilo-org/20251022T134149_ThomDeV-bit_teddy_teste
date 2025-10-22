import { ShortyLinkRepository } from "./shorty-links/shorty-links.repository";
import { UserRepository } from "./user/user.repository";

export class RepositoryModule {
    static register() {
        return {
            userRepository: UserRepository,
            shortyLinkRepository : ShortyLinkRepository
        }
    }
}
