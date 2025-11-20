import { Expose } from 'class-transformer';
import { CommentEntity } from 'src/comments/entities/comment.entities';
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
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'attachments' })
export class AttachmentEntity {
  @Expose({ groups: [ADMIN_GROUP] })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  uuid: string;

  @Column({ type: 'bigint' })
  commentId: number;

  @Column({ type: 'bigint' })
  taskId: number;

  @Column({ type: 'bigint' })
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  filepath: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

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
  @ManyToOne(() => CommentEntity, (comment) => comment.attachments)
  @JoinColumn({ name: 'comment_id', referencedColumnName: 'id' })
  comment: CommentEntity;

  @ManyToOne(() => UserEntity, (user) => user.attachments)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' }) // Maps the foreign key column
  user: UserEntity;

  @ManyToOne(() => TaskEntity, (task) => task.attachments)
  @JoinColumn({ name: 'task_id', referencedColumnName: 'id' }) // Maps the foreign key column
  task: TaskEntity;
}
