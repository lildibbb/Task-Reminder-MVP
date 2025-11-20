import { Expose } from 'class-transformer';
import { AttachmentEntity } from 'src/attachments/entities/attachment.entity';
import { TaskEntity } from 'src/tasks/entities/task.entity';
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

@Entity({ name: 'comments' })
export class CommentEntity {
  public static COMMENT_IMAGE_BASE_PATH = 'comment/';
  public static DISK_NAME = 'default';
  @Expose({ groups: [ADMIN_GROUP] })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  uuid: string;

  @Column({ type: 'bigint' })
  taskId: number;

  @Column({ type: 'bigint', nullable: true })
  parentCommentId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string;

  @Column({ type: 'bigint' })
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  commentContent: string;

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

  @ManyToOne(() => TaskEntity, (task) => task.comments)
  @JoinColumn({ name: 'task_id', referencedColumnName: 'id' })
  task: TaskEntity;

  @ManyToOne(() => UserEntity, (user) => user.comments)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.comment)
  attachments: AttachmentEntity[];

  // Self-referencing relationship: Parent
  @ManyToOne(() => CommentEntity, (comment) => comment.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_comment_id', referencedColumnName: 'id' })
  parent: CommentEntity;

  // Self-referencing relationship: Children (Replies)
  @OneToMany(() => CommentEntity, (comment) => comment.parent)
  children: CommentEntity[];
}
