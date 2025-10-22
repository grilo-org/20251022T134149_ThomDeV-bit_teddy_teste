import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('short_links')
export class ShortLinkEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'original_url', type: 'text' })
    originalUrl: string;

    @Column({ unique: true })
    slug: string;

    @Column({ unique: true })
    alias: string;

    @Column({ name: 'access_count', type: 'int', default: 0 })
    accessCount: number;

    @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
    owner?: UserEntity;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt?: Date | null;
}
