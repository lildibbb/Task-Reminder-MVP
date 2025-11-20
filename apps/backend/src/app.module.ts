import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Settings } from 'luxon';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { RolesModule } from './roles/roles.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { UsersModule } from './users/users.module';

import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { AttachmentsModule } from './attachments/attachments.module';

import databaseConfig from './config/database-config';
import testDatabaseConfig from './config/test-database-config';

import { StorageModule } from './storage/storage.module';
import { StorageOptions } from './storage/interfaces';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { determineSourcePath } from './helper/common';
import { SendEmailModule } from './send-email/send-email.module';
import { ProjectUsersModule } from './project-users/project-users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SeedersModule } from './seeders/seeders.module';

// Set the default timezone for Luxon (using env timezone)
Settings.defaultZone = configuration().TZ;

const NODE_ENV = configuration().node_env;

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (): Promise<TypeOrmModuleOptions> => {
        return {
          ...(NODE_ENV === 'test' ? testDatabaseConfig : databaseConfig),
          entities: [],
          // keepConnectionAlive: true,
          autoLoadEntities: true,
        };
      },
    }),
    StorageModule.registerAsync({
      imports: [ConfigService],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): StorageOptions => {
        const storageConfig = configService.get<StorageOptions>('storage');
        if (!storageConfig) {
          throw new Error('Storage configuration is missing');
        }
        return storageConfig;
      },
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    // To access the files in the public folder
    // Eg. http://localhost:3001/public/your_image_name.jpg
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), determineSourcePath(), `storage/app`),
      exclude: ['/api'],
    }),
    UsersModule,
    UserRolesModule,
    RolesModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
    ActivityLogsModule,
    AttachmentsModule,
    SendEmailModule,
    ProjectUsersModule,
    NotificationsModule,
    SubscriptionsModule,
    SchedulerModule,
    SeedersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
