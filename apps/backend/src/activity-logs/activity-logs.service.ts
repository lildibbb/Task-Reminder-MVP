import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityLogEntity } from './entities/activity-log.entity';
import { Not, Repository } from 'typeorm';
import { CreateActivityLogsDto } from './dto/create-activity-logs.dto';
import { ActionType } from './enums/action-type.enum';
import { TasksService } from '../tasks/tasks.service';
import { CommentsService } from '../comments/comments.service';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly activityLogsRepository: Repository<ActivityLogEntity>,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
  ) {}

  async create(createActivityLogDto: CreateActivityLogsDto) {
    return await this.activityLogsRepository.save(
      this.activityLogsRepository.create({
        ...createActivityLogDto,
      }),
    );
  }
  findAllById(id: number) {
    return this.activityLogsRepository.find({
      where: {
        taskId: id,
        actionType: Not(ActionType.ADD_COMMENT),
      },
      relations: ['user'],
    });
  }
  findAllByUserId(userId: number) {
    return this.activityLogsRepository.find({
      where: { userId },
      order: {
        createdAt: 'DESC',
      },
      relations: ['task'],
    });
  }
  async findByUserId(userId: number) {
    return await this.findAllByUserId(userId);
  }

  async find(id: number) {
    const task = await this.tasksService.findOneById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const comment = await this.commentsService.findAllById(id);

    const activityLog = await this.findAllById(id);
    return {
      task: task,
      comment: comment,
      activityLog: activityLog,
    };
  }
}
