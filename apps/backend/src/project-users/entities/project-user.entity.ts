import { Expose } from 'class-transformer';
import { ProjectEntity } from 'src/projects/entities/project.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'project_users' })
export class ProjectUserEntity {
  @Expose()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;
  @Expose()
  @Column({ unique: true })
  uuid: string;

  @Expose()
  @Column({ type: 'bigint' })
  projectId: number;

  @Column({ type: 'bigint' })
  userId: number;

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

  @ManyToOne(() => ProjectEntity, (project) => project.projectUsers)
  project: ProjectEntity;

  @ManyToOne(() => UserEntity, (user) => user.projectUsers)
  user: UserEntity;
}
