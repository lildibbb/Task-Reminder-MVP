import { NotificationType } from 'src/notifications/enums/notification.enum';
import { TaskAssignedEvent } from '../task-assigned-event';

export class TaskAssignmentHelper {
  static emitAssignmentEvents(
    eventEmitter: any,
    oldId: number | undefined,
    newId: number | undefined,
    title: string,
    titleUnassigned: string,
    assignMsg: string,
    unassignMsg: string,
    assignType: NotificationType,
    unassignType: NotificationType,
  ) {
    if (!oldId && newId) {
      eventEmitter.emit(
        'task.assigned',
        new TaskAssignedEvent(newId, title, assignMsg, assignType, true),
      );
    } else if (oldId && oldId !== newId && newId !== undefined) {
      eventEmitter.emit(
        'task.assigned',
        new TaskAssignedEvent(
          oldId,
          titleUnassigned,
          unassignMsg,
          unassignType,
          true,
        ),
      );
      if (newId) {
        eventEmitter.emit(
          'task.assigned',
          new TaskAssignedEvent(newId, title, assignMsg, assignType, true),
        );
      }
    }
  }
}
