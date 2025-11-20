import { v4 as uuidv4 } from 'uuid';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UserRoleEntity } from 'src/user-roles/entities/user-role.entity';
import { ProjectEntity } from 'src/projects/entities/project.entity';
import { Status } from '../enums/status.enum';
import { ProjectUserEntity } from 'src/project-users/entities/project-user.entity';
import { AttachmentEntity } from 'src/attachments/entities/attachment.entity';
import { TaskEntity } from 'src/tasks/entities/task.entity';
import { ActivityLogEntity } from 'src/activity-logs/entities/activity-log.entity';
import { CommentEntity } from '../../comments/entities/comment.entities';
import { SubscriptionEntity } from '../../subscriptions/entities/subscription.entity';
export const ADMIN_GROUP = 'ADMIN_GROUP';

@Entity({ name: 'users' })
export class UserEntity {
  @Expose()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date | null; // need to define null here so typescript see it as "Date | null" instead of null

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  username: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({
    type: 'enum',
    default: Status.ACTIVE,
    enum: Status,
    enumName: 'user_status_enum',
  })
  status: Status;

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

  @BeforeInsert()
  async hashPassword() {
    if (!this.password) return;
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }

  @BeforeUpdate()
  async hashPasswordReset() {
    if (!this.password) return;
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }

  /* Relationship */
  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user)
  userRoles: UserRoleEntity[];

  @OneToMany(() => ProjectEntity, (project) => project.createdByUser)
  projects: ProjectEntity[];

  @OneToMany(() => ProjectUserEntity, (projectUser) => projectUser.user)
  projectUsers: ProjectUserEntity[];

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.user)
  attachments: AttachmentEntity[];

  @OneToMany(() => TaskEntity, (task) => task.createdByUser)
  createdBy: TaskEntity[];

  @OneToMany(() => TaskEntity, (task) => task.assigneeUser)
  assignedId: TaskEntity[];

  @OneToMany(() => TaskEntity, (task) => task.verifierUser)
  verifierId: TaskEntity[];

  @OneToMany(() => ActivityLogEntity, (activityLog) => activityLog.user)
  activityLogs: ActivityLogEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];

  @OneToMany(() => SubscriptionEntity, (subscription) => subscription.user)
  subscriptions: SubscriptionEntity[];
}
