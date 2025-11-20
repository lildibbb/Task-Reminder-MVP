import { Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity({name: 'subscriptions'})
export class SubscriptionEntity {
  @Expose()
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: number;

  @Column({unique: true})
  uuid: string;

  @Column({type:'bigint'})
  userId: number;

  @Column({ type: 'jsonb' })
  subscription: any;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  @BeforeInsert()
  private insertUuid() {
    this.uuid = uuidv4();
  }

  // Relationship
  @ManyToOne(() => UserEntity, (user) => user.subscriptions)
  @JoinColumn({ name: 'user_id' , referencedColumnName: 'id' })
  user: UserEntity;
}
