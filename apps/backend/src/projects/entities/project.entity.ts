import { Expose } from 'class-transformer';
import { TaskEntity } from 'src/tasks/entities/task.entity';
import { ProjectUserEntity } from 'src/project-users/entities/project-user.entity';
import { ADMIN_GROUP, UserEntity } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'projects' })
export class ProjectEntity {
  @Expose({ groups: [ADMIN_GROUP] })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ name: 'created_by', type: 'bigint' })
  createdBy: number;

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
  @ManyToOne(() => UserEntity, (user) => user.projects)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' }) // Maps the foreign key column
  createdByUser: UserEntity;

  @OneToMany(() => TaskEntity, (task) => task.project)
  tasks: TaskEntity[];

  @OneToMany(() => ProjectUserEntity, (projectUser) => projectUser.project)
  projectUsers: ProjectUserEntity[];
}
