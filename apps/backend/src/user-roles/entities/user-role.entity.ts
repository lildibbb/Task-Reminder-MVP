import { Expose } from 'class-transformer';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'user_roles' })
export class UserRoleEntity {
  @Expose({ groups: ['ADMIN_GROUP'] })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  uuid: string;

  @Expose({ groups: ['ADMIN_GROUP'] })
  @Column({ type: 'bigint' })
  userId: number;

  @Expose({ groups: ['ADMIN_GROUP'] })
  @Column({ type: 'bigint' })
  roleId: number;

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
  /* Relationship */
  @ManyToOne(() => UserEntity, (user) => user.userRoles)
  user: UserEntity;

  @ManyToOne(() => RoleEntity, (role) => role.userRoles)
  role: RoleEntity;
}
