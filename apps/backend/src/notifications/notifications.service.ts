import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as webPush from 'web-push';

import { NotificationEntity } from './entities/notification.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Payload } from './interface/payload.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { TaskCommentEvent } from '../events/task-comment-event';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly subscriptionService: SubscriptionsService,
    private readonly configService: ConfigService,
  ) {
    const publicKey = this.configService.get<string>('webPush.vapidPublicKey');
    const privateKey = this.configService.get<string>(
      'webPush.vapidPrivateKey',
    );
    const mailto = this.configService.get<string>('webPush.vapidMailto');

    if (!publicKey || !privateKey || !mailto) {
      this.logger.error(
        'VAPID keys or mailto are not defined in environment variables.',
      );
      return;
    }

    webPush.setVapidDetails(mailto, publicKey, privateKey);
  }

  findAll(userId: number) {
    return this.notificationRepository.find({ where: { userId: userId } });
  }
  async getNotifications(userId: number) {
    return await this.findAll(userId);
  }
  async sendNotificationToUser(createNotificationDto: CreateNotificationDto) {
    const subs = await this.subscriptionService.findOneActiveByUserId(
      createNotificationDto.userId,
    );

    if (!subs) {
      this.logger.warn(
        `No active push subscription found for user ID: ${createNotificationDto.userId}`,
      );
    }

    if (createNotificationDto.isPushNotification && subs) {
      const pushSubscription = subs.subscription as webPush.PushSubscription;
      const payload: Payload = {
        title: createNotificationDto.title,
        body: createNotificationDto.content,
        data: createNotificationDto.data,
        actions: createNotificationDto.action,
      };

      try {
        await webPush.sendNotification(
          pushSubscription,
          JSON.stringify(payload),
        );
        this.logger.log(
          `Notification sent to user ID: ${createNotificationDto.userId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send notification to user ID: ${createNotificationDto.userId}`,
          error.stack,
        );
      }
    }
    this.logger.log(
      `Notification saved for user ID: ${createNotificationDto.userId}`,
    );
    return await this.notificationRepository.save(
      this.notificationRepository.create(createNotificationDto),
    );
  }

  async sendBulkNotification(
    userIds: number[],
    notificationData: Omit<CreateNotificationDto, 'userId'>,
  ) {
    for (const userId of userIds) {
      const dto: CreateNotificationDto = {
        ...notificationData,
        userId,
      };
      await this.sendNotificationToUser(dto);
    }
  }

  @OnEvent('task.comment.added', { async: true })
  async handleTaskCommentAdded(event: TaskCommentEvent) {
    const notificationDataForBulk: Omit<CreateNotificationDto, 'userId'> = {
      title: event.title,
      content: event.content,
      isPushNotification: event.isPushNotification,
      notificationType: event.notificationType,
      data: event.data,
    };

    await this.sendBulkNotification(event.userId, notificationDataForBulk);
  }

  @OnEvent('task.assigned', { async: true })
  async handleTaskAssigned(dto: CreateNotificationDto) {
    await this.sendNotificationToUser(dto);
  }

  @OnEvent('task.dueSoon', { async: true })
  async handleTaskDueSoon(event: TaskCommentEvent) {
    const notificationDataForBulk: Omit<CreateNotificationDto, 'userId'> = {
      title: event.title,
      content: event.content,
      isPushNotification: event.isPushNotification,
      notificationType: event.notificationType,
      data: event.data,
    };

    await this.sendBulkNotification(event.userId, notificationDataForBulk);
  }

  @OnEvent('task.verified', { async: true })
  async handleTaskVerified(dto: CreateNotificationDto) {
    await this.sendNotificationToUser(dto);
  }

  @OnEvent('task.doing', { async: true })
  async handleTaskDoing(event: TaskCommentEvent) {
    const notificationDataForBulk: Omit<CreateNotificationDto, 'userId'> = {
      title: event.title,
      content: event.content,
      isPushNotification: event.isPushNotification,
      notificationType: event.notificationType,
      data: event.data,
    };
    await this.sendBulkNotification(event.userId, notificationDataForBulk);
  }

  @OnEvent('task.pending_verification', { async: true })
  async handleTaskPendingVerification(event: TaskCommentEvent) {
    const notificationDataForBulk: Omit<CreateNotificationDto, 'userId'> = {
      title: event.title,
      content: event.content,
      isPushNotification: event.isPushNotification,
      notificationType: event.notificationType,
      data: event.data,
    };
    await this.sendBulkNotification(event.userId, notificationDataForBulk);
  }

  @OnEvent('task.verification_failed', { async: true })
  async handleTaskVerificationFailed(event: TaskCommentEvent) {
    const notificationDataForBulk: Omit<CreateNotificationDto, 'userId'> = {
      title: event.title,
      content: event.content,
      isPushNotification: event.isPushNotification,
      notificationType: event.notificationType,
      data: event.data,
    };
    await this.sendBulkNotification(event.userId, notificationDataForBulk);
  }

  @OnEvent('task.closed', { async: true })
  async handleTaskClosed(event: TaskCommentEvent) {
    const notificationDataForBulk: Omit<CreateNotificationDto, 'userId'> = {
      title: event.title,
      content: event.content,
      isPushNotification: event.isPushNotification,
      notificationType: event.notificationType,
      data: event.data,
    };
    await this.sendBulkNotification(event.userId, notificationDataForBulk);
  }
}
