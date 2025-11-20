import { NotificationType } from '../notifications/enums/notification.enum';

export class TaskAssignedEvent {
  constructor(
    public readonly userId: number,
    public readonly title: string,
    public readonly content: string,
    public readonly notificationType: NotificationType,
    public readonly isPushNotification: boolean = true,
    public readonly data?: Record<string, any>,
    public readonly action?: Record<string, any>[],
  ) {}
}
