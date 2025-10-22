
export class Utils {
    static base62Slug(length = 6): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let slug = '';
        for (let i = 0; i < length; i++) {
            slug += chars[Math.floor(Math.random() * chars.length)];
        }
        return slug;
    }
}


