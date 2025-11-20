import { Expose } from 'class-transformer';
import { ADMIN_GROUP, UserEntity } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActionType } from '../enums/action-type.enum';
import { v4 as uuidv4 } from 'uuid';
import { TaskEntity } from 'src/tasks/entities/task.entity';

@Entity({ name: 'activity_logs' })
export class ActivityLogEntity {
  @Expose({ groups: [ADMIN_GROUP] })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  uuid: string;

  @Column({ type: 'bigint' })
  userId: number;

  @Column({ type: 'bigint' })
  taskId: number;

  @Column({ type: 'enum', enum: ActionType, enumName: 'action_type_enum' })
  actionType: ActionType;

  @Column({ type: 'json', nullable: true })
  actionDetails: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @BeforeInsert()
  private insertUuid() {
    this.uuid = uuidv4();
  }

  /* Relationship */
  @ManyToOne(() => UserEntity, (user) => user.activityLogs)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' }) // Maps the foreign key column
  user: UserEntity;

  @ManyToOne(() => TaskEntity, (task) => task.activityLogs)
  @JoinColumn({ name: 'task_id', referencedColumnName: 'id' }) // Maps the foreign key column
  task: TaskEntity;
}
