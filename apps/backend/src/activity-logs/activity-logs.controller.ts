import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import {
  ApiBearerAuth,
  ApiFoundResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { successResponse } from '../helper/response';
import { apiPrefix } from '../constant/apiPrefix';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller(apiPrefix + 'activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get(':taskId/get-activity-logs')
  @ApiFoundResponse()
  @ApiNotFoundResponse()
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({ name: 'taskId', type: Number })
  async getActivityLogsById(@Param('taskId', ParseIntPipe) taskId: number) {
    return successResponse(
      await this.activityLogsService.find(taskId),
      'activity logs fetched successfully',
    );
  }

  @Get(':userId')
  @ApiFoundResponse()
  @ApiNotFoundResponse()
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({ name: 'userId', type: Number })
  async getActivityLogsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return successResponse(
      await this.activityLogsService.findByUserId(userId),
      'activity logs fetched successfully',
    );
  }
}
