import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TasksModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
