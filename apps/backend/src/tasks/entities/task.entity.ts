import { Expose } from 'class-transformer';
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
import { TaskStatus } from '../enums/task-status.enum';
import { Priority } from '../enums/priority.enum';
import { v4 as uuidv4 } from 'uuid';
import { ProjectEntity } from 'src/projects/entities/project.entity';
import { CommentEntity } from 'src/comments/entities/comment.entities';
import { AttachmentEntity } from 'src/attachments/entities/attachment.entity';
import { ActivityLogEntity } from 'src/activity-logs/entities/activity-log.entity';
@Entity({ name: 'tasks' })
export class TaskEntity {
  public static TASK_IMAGE_BASE_PATH = 'task/';
  public static DISK_NAME = 'default';
  @Expose({ groups: [ADMIN_GROUP] })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  uuid: string;

  @Column({ type: 'bigint', nullable: true })
  projectId: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'jsonb', nullable: true })
  description: any;

  @Column({
    type: 'enum',
    default: TaskStatus.NEW,
    enum: TaskStatus,
    enumName: 'task_status_enum',
  })
  status: TaskStatus;

  @Column({ type: 'jsonb', nullable: true })
  expectedResult: any;

  @Column({ type: 'enum', enum: Priority, enumName: 'task_priority_enum' })
  priority: Priority;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ name: 'created_by', type: 'bigint' })
  createdBy: number;

  @Column({ type: 'bigint', nullable: true })
  assigneeId: number;

  @Column({ type: 'bigint', nullable: true })
  verifierId: number;

  @Column({ type: 'boolean', default: false })
  isRepeating: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  repeatFrequency: string;

  @Column({ type: 'varchar', nullable: true })
  reminderTime: string;

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

  @ManyToOne(() => ProjectEntity, (project) => project.tasks)
  @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })
  project: ProjectEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.task)
  comments: CommentEntity[];

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.task)
  attachments: AttachmentEntity[];

  @ManyToOne(() => UserEntity, (user) => user.createdBy)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdByUser: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.assignedId)
  @JoinColumn({ name: 'assignee_id', referencedColumnName: 'id' })
  assigneeUser: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.verifierId)
  @JoinColumn({ name: 'verifier_id', referencedColumnName: 'id' })
  verifierUser: UserEntity;

  @OneToMany(() => ActivityLogEntity, (activityLog) => activityLog.task)
  activityLogs: ActivityLogEntity[];
}
