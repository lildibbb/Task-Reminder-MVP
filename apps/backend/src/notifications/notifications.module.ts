import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as webPush from 'web-push';

import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationEntity } from './entities/notification.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

export const WEB_PUSH_PROVIDER = 'WEB_PUSH';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    ConfigModule.forRoot(),
    SubscriptionsModule,
  ],
  providers: [
    NotificationsService,
    {
      provide: WEB_PUSH_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const publicKey = configService.get<string>('webPush.vapidPublicKey');
        const privateKey = configService.get<string>('webPush.vapidPrivateKey');
        const mailto = configService.get<string>('webPush.vapidMailto');

        if (!publicKey || !privateKey || !mailto) {
          throw new Error(
            'VAPID keys or mailto are not defined in environment variables.',
          );
        }

        webPush.setVapidDetails(mailto, publicKey, privateKey);
        return webPush;
      },
      inject: [ConfigService],
    },
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}