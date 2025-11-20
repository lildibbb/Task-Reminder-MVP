import { Module } from '@nestjs/common';
import { ProjectUsersController } from './project-users.controller';
import { ProjectUsersService } from './project-users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectUserEntity } from './entities/project-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectUserEntity])],
  controllers: [ProjectUsersController],
  providers: [ProjectUsersService],
})
export class ProjectUsersModule {}
