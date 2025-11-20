import { Injectable, Logger } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskDueEvent } from '../events/task-due-event';
import { TaskTemplate } from '../events/template/template';
import { NotificationType } from '../notifications/enums/notification.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { formatDate, formatTimeLeft } from 'src/helper/common';

const EVERY_15_MINUTES = '*/15 * * * *'; // Cron expression for every 15 minutes as cron-expression.enum.d.ts doesn't have this predefined
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly tasksService: TasksService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(EVERY_15_MINUTES)
  async notifyUpcomingDueDates() {
    const tasksNearingDueDate =
      await this.tasksService.findTasksNearingDueDate();

    if (tasksNearingDueDate.length === 0) {
      return;
    }

    for (const task of tasksNearingDueDate) {
      const recipientUserIds = [
        task.assigneeId,
        task.verifierId,
        task.createdBy,
      ].filter((id) => id !== null && id !== undefined && !isNaN(id));

      const data = {
        url: `${process.env.FRONTEND_URL}/task/${task.id}/slugHere`,
      };

      this.eventEmitter.emit(
        'task.dueSoon',
        new TaskDueEvent(
          recipientUserIds,
          TaskTemplate.title.taskDueReminder,
          TaskTemplate.content.taskDueReminder(
            task.title,
            formatTimeLeft(task.dueDate),
          ),
          NotificationType.TASK_DUE,
          true,
          data,
        ),
      );
    }
  }
  @Cron(EVERY_15_MINUTES)
  async notifyVerificationFailed() {
    const tasksVerificationFailed =
      await this.tasksService.findTasksStuckInVerificationFailed();

    if (tasksVerificationFailed.length === 0) {
      return;
    }

    for (const task of tasksVerificationFailed) {
      try {
        const recipientUserIds = [
          task.assigneeId,
          task.verifierId,
          task.createdBy,
        ].filter((id) => id !== null && id !== undefined && !isNaN(id));

        const data = {
          url: `${process.env.FRONTEND_URL}/task/${task.id}/slugHere`,
        };

        this.eventEmitter.emit(
          'task.verificationFailed',
          new TaskDueEvent(
            recipientUserIds,
            TaskTemplate.title.verificationFailReminder,
            TaskTemplate.content.verificationFailReminder(
              task.title,
              task.assigneeUser.name,
            ),
            NotificationType.TASK_VERIFICATION_FAILED,
            true,
            data,
          ),
        );
      } catch (error) {
        this.logger.error(
          `Failed to process notification for task ID ${task.id}:`,
          error,
        );
      }
    }
  }
  @Cron(EVERY_15_MINUTES)
  async notifyPendingVerification() {
    const tasksPendingVerification =
      await this.tasksService.findTasksStuckInPendingVerification();

    if (tasksPendingVerification.length === 0) {
      return;
    }

    for (const task of tasksPendingVerification) {
      try {
        const recipientUserIds = [
          task.assigneeId,
          task.verifierId,
          task.createdBy,
        ].filter((id) => id !== null && id !== undefined && !isNaN(id));

        const data = {
          url: `${process.env.FRONTEND_URL}/task/${task.id}/slugHere`,
        };

        this.eventEmitter.emit(
          'task.pendingVerification',
          new TaskDueEvent(
            recipientUserIds,
            TaskTemplate.title.verificationReminder,
            TaskTemplate.content.verificationReminder(
              task.title,
              task.verifierUser.name,
              formatTimeLeft(task.dueDate),
            ),
            NotificationType.TASK_PENDING_VERIFICATION,
            true,
            data,
          ),
        );
      } catch (error) {
        this.logger.error(
          `Failed to process notification for task ID ${task.id}:`,
          error,
        );
      }
    }
  }

  // This cron job checks for tasks that have been verified and isRepeating = false
  @Cron(EVERY_15_MINUTES)
  async notifyVerifiedTasks() {
    const tasksVerified =
      await this.tasksService.findTasksStuckInVerificationSuccess();

    if (tasksVerified.length === 0) {
      return;
    }

    for (const task of tasksVerified) {
      try {
        const recipientUserIds = [
          task.assigneeId,
          task.verifierId,
          task.createdBy,
        ].filter((id) => id !== null && id !== undefined && !isNaN(id));

        const data = {
          url: `${process.env.FRONTEND_URL}/task/${task.id}/slugHere`,
        };

        this.eventEmitter.emit(
          'task.verified',
          new TaskDueEvent(
            recipientUserIds,
            TaskTemplate.title.verificationSuccessReminder,
            TaskTemplate.content.verificationSuccessReminder(task.title),
            NotificationType.TASK_VERIFIED,
            true,
            data,
          ),
        );
      } catch (error) {
        this.logger.error(
          `Failed to process notification for task ID ${task.id}:`,
          error,
        );
      }
    }
  }
  // This cron job update the status of tasks that has isRepeating = true to 'new'
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async changeStatusToNewDaily() {
    const tasksToUpdate =
      await this.tasksService.findTasksWithRepeatingStatus();
    if (tasksToUpdate.length === 0) {
      return;
    }
    for (const task of tasksToUpdate) {
      try {
        await this.tasksService.cronUpdateStatusDaily(task.id);
        this.logger.log(
          `Task ID ${task.id} status updated to 'new' successfully.`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to update task ID ${task.id} status to 'new':`,
          error,
        );
      }
    }
  }
}
