import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './entities/task.entity';
import { Between, LessThan, MoreThan, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { uploadFilesToS3 } from '../helper/file-upload';
import { processDocumentContent } from '../helper/processContentNode';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActionType } from '../activity-logs/enums/action-type.enum';
import { UsersService } from '../users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskAssignedEvent } from '../events/task-assigned-event';
import { NotificationType } from '../notifications/enums/notification.enum';
import { TaskTemplate } from '../events/template/template';
import { TaskAssignmentHelper } from '../events/helpers/task-assignment';
import { TaskStatus } from './enums/task-status.enum';
import { Priority } from './enums/priority.enum';
import { formatDate } from '../helper/common';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @Inject(forwardRef(() => ActivityLogsService))
    private readonly activityLogsService: ActivityLogsService,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  findDueDate(now: Date, soon: Date) {
    return this.taskRepository.find({
      where: {
        dueDate: Between(now, soon),
      },
      relations: ['createdByUser', 'assigneeUser', 'verifierUser'],
    });
  }
  findTasksNearingDueDate() {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return this.taskRepository.find({
      where: {
        status: TaskStatus.NEW,
        dueDate: MoreThan(now) && LessThan(in24Hours),
      },
      relations: ['createdByUser', 'assigneeUser', 'verifierUser'],
    });
  }

  findTasksStuckInVerificationFailed() {
    return this.taskRepository.find({
      where: {
        status: TaskStatus.VERIFICATION_FAILED,
      },
      relations: ['createdByUser', 'assigneeUser', 'verifierUser'],
    });
  }
  findTasksStuckInPendingVerification() {
    return this.taskRepository.find({
      where: {
        status: TaskStatus.PENDING_VERIFICATION,
      },
      relations: ['createdByUser', 'assigneeUser', 'verifierUser'],
    });
  }
  findTasksStuckInVerificationSuccess() {
    return this.taskRepository.find({
      where: {
        status: TaskStatus.VERIFIED,
        isRepeating: false,
      },
      relations: ['createdByUser', 'assigneeUser', 'verifierUser'],
    });
  }
  findTasksWithRepeatingStatus() {
    return this.taskRepository.find({
      where: {
        status: TaskStatus.VERIFIED,
        isRepeating: true,
      },
      relations: ['createdByUser', 'assigneeUser', 'verifierUser'],
    });
  }
  findAll() {
    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdByUser', 'createdByUser')
      .leftJoinAndSelect('task.assigneeUser', 'assigneeUser')
      .leftJoinAndSelect('task.verifierUser', 'verifierUser')
      .leftJoinAndSelect('task.comments', 'comments')

      .addOrderBy(
        `CASE WHEN task.status = '${TaskStatus.CLOSED}' THEN 1 ELSE 0 END`,
        'ASC',
      )
      .addOrderBy(
        `CASE
        WHEN task.priority = '${Priority.CRITICAL}' THEN 0
        WHEN task.priority = '${Priority.HIGH}' THEN 1
        WHEN task.priority = '${Priority.MEDIUM}' THEN 2
        WHEN task.priority = '${Priority.LOW}' THEN 3
        ELSE 4
      END`,
        'ASC',
      )

      .addOrderBy('task.createdAt', 'DESC')

      .getMany();
  }

  findOneById(id: number) {
    return this.taskRepository.findOne({
      where: { id: id },
      relations: ['createdByUser', 'assigneeUser', 'verifierUser'],
    });
  }

  findAllByUserId(userId: number) {
    return this.taskRepository.find({
      where: [
        { assigneeId: userId },
        { verifierId: userId },
        { createdBy: userId },
      ],
    });
  }

  async create(
    createTaskDto: CreateTaskDto,
    createdBy: number,
    files?: Express.Multer.File[],
  ) {
    try {
      const { description, expectedResult, ...restOfDto } = createTaskDto;

      let processedDescription: object | null = null;
      let processedExpectedResult: object | null = null;

      let fileUrlMap: Record<string, string> = {};
      if (files && files.length > 0) {
        fileUrlMap = await uploadFilesToS3(
          files,
          TaskEntity.TASK_IMAGE_BASE_PATH,
          TaskEntity.DISK_NAME,
        );
      }

      let totalUnusedFileCount = 0;

      if (description) {
        processedDescription = JSON.parse(description);
        const unusedCount = processDocumentContent(
          processedDescription,
          fileUrlMap,
          files || [],
        );
        totalUnusedFileCount += unusedCount;
      }

      if (expectedResult) {
        processedExpectedResult = JSON.parse(expectedResult);
        const unusedCount = processDocumentContent(
          processedExpectedResult,
          fileUrlMap,
          files || [],
        );
        totalUnusedFileCount += unusedCount;
      }

      if (totalUnusedFileCount > 0) {
        this.logger.warn(
          `Not all uploaded files were used: ${totalUnusedFileCount} files remain unused`,
        );
      }

      const data = {
        url: process.env.FRONTEND_URL + '/task',
      };
      const action = [
        {
          action: TaskTemplate.action.action,
          title: TaskTemplate.action.title,
        },
      ];

      const savedTask = await this.taskRepository.save(
        this.taskRepository.create({
          ...restOfDto,
          status: TaskStatus.NEW,
          description: processedDescription,
          expectedResult: processedExpectedResult,
          createdBy: createdBy,
        }),
      );

      const task = await this.findOneById(savedTask.id);
      if (!task) {
        throw new NotFoundException('Failed to retrieve task after creation.');
      }
      await this.handleTaskEvents(task, undefined, createdBy);

      return task;
    } catch (error) {
      this.logger.error(`Error creating task: ${error.message}`, error.stack);

      if (error instanceof SyntaxError) {
        throw new UnprocessableEntityException(
          'Invalid JSON format in description or expected result',
        );
      }

      throw error;
    }
  }
  async cronUpdateStatusDaily(taskId: number) {
    return this.taskRepository.update(taskId, { status: TaskStatus.NEW });
  }
  async update(
    updateTaskDto: UpdateTaskDto,
    taskId: number,
    userId: number,
    files?: Express.Multer.File[],
  ) {
    try {
      const existTask = await this.findOneById(taskId);
      if (!existTask) {
        throw new NotFoundException(`Task with id ${taskId} not found`);
      }

      const payloadToUpdate = await this.buildUpdatePayload(
        updateTaskDto,
        files,
      );

      await this.taskRepository.update(taskId, payloadToUpdate);

      const updatedTask = await this.findOneById(taskId);
      if (!updatedTask) {
        throw new NotFoundException('Failed to retrieve task after update.');
      }

      await this.handleTaskEvents(updatedTask, existTask, userId);

      await this.createActivityLogs(
        updateTaskDto,
        taskId,
        userId,
        payloadToUpdate.description,
        payloadToUpdate.expectedResult,
      );

      return updatedTask;
    } catch (error) {
      this.logger.error(`Error updating task: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async buildUpdatePayload(
    updateTaskDto: UpdateTaskDto,
    files?: Express.Multer.File[],
  ): Promise<Partial<TaskEntity>> {
    const {
      description,
      expectedResult,
      resolvedReportId,
      startDate,
      dueDate,
      ...restOfDto
    } = updateTaskDto;
    const payloadToUpdate: Partial<TaskEntity> = { ...restOfDto };
    console.log('Payload to update:', payloadToUpdate);
    if (startDate) {
      payloadToUpdate.startDate = new Date(startDate);
    }
    if (dueDate) {
      payloadToUpdate.dueDate = new Date(dueDate);
    }
    if (description === undefined && expectedResult === undefined) {
      return payloadToUpdate;
    }

    const fileUrlMap = await uploadFilesToS3(
      files || [],
      TaskEntity.TASK_IMAGE_BASE_PATH,
      TaskEntity.DISK_NAME,
    );

    let totalUnusedFileCount = 0;

    if (description !== undefined) {
      const descriptionObject = JSON.parse(description || '{}');
      totalUnusedFileCount += processDocumentContent(
        descriptionObject,
        fileUrlMap,
        files || [],
      );
      payloadToUpdate.description = descriptionObject;
    }

    if (expectedResult !== undefined) {
      const expectedResultObject = JSON.parse(expectedResult || '{}');
      totalUnusedFileCount += processDocumentContent(
        expectedResultObject,
        fileUrlMap,
        files || [],
      );
      payloadToUpdate.expectedResult = expectedResultObject;
    }

    if (totalUnusedFileCount > 0) {
      this.logger.warn(
        `Not all uploaded files were used: ${totalUnusedFileCount} files remain unused`,
      );
    }

    return payloadToUpdate;
  }

  private async handleTaskEvents(
    newTask: TaskEntity,
    oldTask?: TaskEntity,
    actionTakerId?: number,
  ) {
    const action = [
      {
        action: TaskTemplate.action.action,
        title: TaskTemplate.action.title,
      },
    ];

    this.handleAssignmentEvents(newTask, oldTask);

    if (!oldTask || newTask.status !== oldTask.status) {
      this.handleStatusChangeEvents(
        newTask,
        newTask.status,
        action,
        actionTakerId,
      );
    }
  }

  private handleAssignmentEvents(
    newTask: TaskEntity,

    oldTask?: TaskEntity,
  ) {
    const oldAssigneeId = oldTask?.assigneeId;
    const oldVerifierId = oldTask?.verifierId;

    TaskAssignmentHelper.emitAssignmentEvents(
      this.eventEmitter,
      oldAssigneeId,
      newTask.assigneeId,
      TaskTemplate.title.taskAssignee,
      TaskTemplate.title.taskUnassign,
      TaskTemplate.content.taskAssignee(newTask.title),
      TaskTemplate.content.taskUnassign(newTask.title),
      NotificationType.TASK_ASSIGNED,
      NotificationType.TASK_UNASSIGNED,
    );

    TaskAssignmentHelper.emitAssignmentEvents(
      this.eventEmitter,
      oldVerifierId,
      newTask.verifierId,
      TaskTemplate.title.taskVerifier,
      TaskTemplate.title.taskUnassign,
      TaskTemplate.content.taskVerifier(newTask.title),
      TaskTemplate.content.taskUnassign(newTask.title),
      NotificationType.TASK_VERIFIER,
      NotificationType.TASK_UNASSIGNED,
    );
  }

  private handleStatusChangeEvents(
    existTask: TaskEntity,
    newStatus: TaskStatus,
    action: any[],
    actionTakerId?: number,
  ) {
    const statusEventMap = {
      [TaskStatus.NEW]: {
        event: 'task.created',
        title: TaskTemplate.title.newTask,
        content: TaskTemplate.content.newTask(
          existTask.title,
          existTask.assigneeUser.name,
        ),
        type: NotificationType.TASK_CREATED,

        getRecipients: (task: TaskEntity) => [task.assigneeId, task.verifierId],
      },
      [TaskStatus.VERIFIED]: {
        event: 'task.verified',
        title: TaskTemplate.title.taskVerified,
        content: TaskTemplate.content.taskVerified(
          existTask.title,
          existTask.verifierUser.name,
        ),
        type: NotificationType.TASK_VERIFIED,

        getRecipients: (task: TaskEntity) => [task.assigneeId],
      },
      [TaskStatus.DOING]: {
        event: 'task.doing',
        title: TaskTemplate.title.taskStarted,
        content: TaskTemplate.content.taskStarted(
          existTask.title,
          existTask.assigneeUser.name,
        ),
        type: NotificationType.TASK_DOING,

        getRecipients: (task: TaskEntity) => [task.verifierId, task.createdBy],
      },
      [TaskStatus.PENDING_VERIFICATION]: {
        event: 'task.pending_verification',
        title: TaskTemplate.title.taskPendingVerification,
        content: TaskTemplate.content.taskPendingVerification(
          existTask.title,
          existTask.assigneeUser.name,
        ),
        type: NotificationType.TASK_PENDING_VERIFICATION,
        getRecipients: (task: TaskEntity) => [task.verifierId],
      },
      [TaskStatus.VERIFICATION_FAILED]: {
        event: 'task.verification_failed',
        title: TaskTemplate.title.verificationFailed,
        content: TaskTemplate.content.verificationFailed(
          existTask.title,
          existTask.assigneeUser.name,
        ),
        type: NotificationType.TASK_VERIFICATION_FAILED,

        getRecipients: (task: TaskEntity) => [task.assigneeId],
      },
      [TaskStatus.CLOSED]: {
        event: 'task.closed',
        title: TaskTemplate.title.taskClosed,
        content: TaskTemplate.content.taskClosed(
          existTask.title,
          formatDate(new Date().toISOString()),
        ),
        type: NotificationType.TASK_CLOSED,

        getRecipients: (task: TaskEntity) => [task.assigneeId, task.verifierId],
      },
    };

    const eventConfig = statusEventMap[newStatus];
    if (!eventConfig) {
      return;
    }

    const recipientIds = eventConfig.getRecipients(existTask);

    const uniqueRecipientIds = Array.from(
      new Set(
        recipientIds
          .filter((id) => id != null)
          .filter((id) => id !== actionTakerId),
      ),
    );

    uniqueRecipientIds.forEach((recipientId) => {
      this.eventEmitter.emit(
        eventConfig.event,
        new TaskAssignedEvent(
          recipientId as number,
          eventConfig.title,
          eventConfig.content,
          eventConfig.type,
          true,
          {
            url: `${process.env.FRONTEND_URL}/task/${existTask.id}/slugHere`,
          },
          action,
        ),
      );
    });
  }

  private async createActivityLogs(
    dto: UpdateTaskDto,
    taskId: number,
    userId: number,
    descriptionObject: any,
    expectedResultObject: any,
  ) {
    const { resolvedReportId, status } = dto;
    const fieldToActionMap = {
      resolvedReportId: {
        actionType: ActionType.COMPLETION_REPORT_RESOLUTION,
        getDetails: (value: any) => ({
          action:
            status === TaskStatus.VERIFIED
              ? 'approved completion report'
              : 'rejected completion report',
          target: resolvedReportId,
        }),
      },

      status: {
        actionType: ActionType.CHANGE_STATUS,
        getDetails: (value: string) => ({
          action: 'changed status',
          target: value,
        }),
      },
      assigneeId: {
        actionType: ActionType.ASSIGN_ASSIGNEE,
        getDetails: async (value: number) => {
          const user = await this.usersService.findOneOrFailByID(value);
          return {
            action: 'assigned',
            target: user?.name || `User ${value}`,
          };
        },
      },
      dueDate: {
        actionType: ActionType.CHANGE_DUE_DATE,
        getDetails: (value: any) => ({
          action: 'set due date to',
          target: value,
        }),
      },
      priority: {
        actionType: ActionType.CHANGE_PRIORITY,
        getDetails: (value: string) => ({
          action: 'changed priority to',
          target: value,
        }),
      },
      expectedResult: {
        actionType: ActionType.CHANGE_EXPECTED_RESULT,
        getDetails: (value: any) => ({
          action: 'updated expected result',
          content: expectedResultObject,
        }),
      },
      title: {
        actionType: ActionType.CHANGE_TITLE,
        getDetails: (value: string) => ({
          action: 'updated title',
          target: value,
        }),
      },
      description: {
        actionType: ActionType.CHANGE_DESCRIPTION,
        getDetails: (value: any) => ({
          action: 'updated description',
          content: descriptionObject,
        }),
      },
    };

    for (const [field, value] of Object.entries(dto)) {
      if (!fieldToActionMap[field] || value === null || value === undefined) {
        continue;
      }

      try {
        const { actionType, getDetails } = fieldToActionMap[field];

        const actionDetails = await getDetails(value);

        await this.activityLogsService.create({
          taskId,
          userId,
          actionType,
          actionDetails,
        });

        this.logger.log(`Created activity log for ${field} change`);
      } catch (error) {
        this.logger.error(
          `Failed to create activity log for ${field}: ${error.message}`,
          error.stack,
        );
      }
    }
  }
}
