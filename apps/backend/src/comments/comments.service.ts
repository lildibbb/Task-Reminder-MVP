import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entities';
import { Repository, IsNull } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { uploadFilesToS3 } from '../helper/file-upload';
import { processDocumentContent } from '../helper/processContentNode';
import { ActionType } from '../activity-logs/enums/action-type.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskCommentEvent } from '../events/task-comment-event';
import { TaskTemplate } from '../events/template/template';
import { NotificationType } from '../notifications/enums/notification.enum';
import { TasksService } from '../tasks/tasks.service';
import { TaskStatus } from 'src/tasks/enums/task-status.enum';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @Inject(forwardRef(() => ActivityLogsService))
    private readonly activityLogsService: ActivityLogsService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
  ) {}
  findAllById(id: number) {
    return this.commentRepository.find({
      where: { taskId: id, parentCommentId: IsNull() },
      relations: ['parent', 'children', 'children.user', 'user'],
    });
  }

  async create(
    taskId: number,
    createCommentDto: CreateCommentDto,
    userId: number,
    files?: Express.Multer.File[],
  ) {
    console.log('comment content: ', createCommentDto.commentContent);
    console.log('userId', userId);
    try {
      const commentContent = JSON.parse(
        createCommentDto.commentContent || '{}',
      );

      const fileUrlMap = await uploadFilesToS3(
        files || [],
        CommentEntity.COMMENT_IMAGE_BASE_PATH,
        CommentEntity.DISK_NAME,
      );

      const unusedFileCount = processDocumentContent(
        commentContent,
        fileUrlMap,
        files || [],
      );
      if (unusedFileCount > 0) {
        this.logger.warn(
          'Not all uploaded files were used: ${unusedFileCount} files remain unused',
        );
      }
      const createActivityLogDto = {
        taskId: taskId,
        userId: userId,
        actionType: ActionType.ADD_COMMENT,
        actionDetails: commentContent,
      };

      if (createCommentDto.type === 'completion_report') {
        await this.tasksService.update(
          { status: TaskStatus.PENDING_VERIFICATION },
          taskId,
          userId,
        );
      }
      const savedComment = await this.commentRepository.save(
        this.commentRepository.create({
          taskId: taskId,
          ...createCommentDto,
          type: createCommentDto.type || 'comment',
          commentContent: commentContent,
          userId: userId,
        }),
      );

      const commentAdded = await this.commentRepository.findOne({
        where: { id: savedComment.id },
        relations: [
          'user',
          'task',
          'task.assigneeUser',
          'task.createdByUser',
          'task.verifierUser',
        ],
      });
      const recipientUserIds = [
        commentAdded?.task?.assigneeId,
        commentAdded?.task?.createdBy,
        commentAdded?.task?.verifierId,
      ]
        .map((id) => (id !== undefined ? id : 0))
        .filter((id) => id && id !== userId);

      const data = {
        url: `${process.env.FRONTEND_URL}/task/${commentAdded?.task?.id}/slugHere`, // use config here instead of direct process.env
      };
      const action = [
        {
          action: TaskTemplate.action.action,
          title: TaskTemplate.action.title,
        },
      ];
      if (commentAdded?.type === 'comment') {
        this.eventEmitter.emit(
          'task.comment.added',
          new TaskCommentEvent(
            recipientUserIds,
            `${commentAdded!.user.name} has commented on your task! `,
            'checkout now',
            NotificationType.TASK_COMMENT,
            true,
            data,
            action,
          ),
        );
      }
      let activityLog;
      try {
        activityLog =
          await this.activityLogsService.create(createActivityLogDto);
      } catch (error) {
        throw new UnprocessableEntityException(
          'Error creating activity log',
          error,
        );
      }

      return { savedComment, activityLog };
    } catch (error) {
      this.logger.error(
        `Error creating comment: ${error.message}`,
        error.stack,
      );
      throw new UnprocessableEntityException('Invalid comment format');
    }
  }
}
