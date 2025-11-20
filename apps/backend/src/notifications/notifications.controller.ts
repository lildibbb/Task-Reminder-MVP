import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { apiPrefix } from '../constant/apiPrefix';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  CreateNotificationSwaggerDto,
} from './dto/create-notification.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiFoundResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { successResponse } from '../helper/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller(apiPrefix + 'notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: CreateNotificationSwaggerDto,
    description: 'Notification data to be sent',
  })
  async sendNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return successResponse(
      await this.notificationsService.sendNotificationToUser(
        createNotificationDto,
      ),
      'Notification sent successfully',
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('')
  @ApiFoundResponse()
  @ApiNotFoundResponse()
  async find(@Request() req) {
    return successResponse(
      await this.notificationsService.getNotifications(req.user.userId),
      'Notifications fetched successfully',
    );
  }
}
