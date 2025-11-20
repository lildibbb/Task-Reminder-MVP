import { Body, Controller, Delete, Param, ParseIntPipe, Patch,  Put, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  CreateUpdateSubscriptionDto,
  CreateUpdateSubscriptionSwaggerDto,
} from './dto/create-update-subscription.dto';
import { successResponse } from '../helper/response';
import { apiPrefix } from '../constant/apiPrefix';


@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller(apiPrefix + 'subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Put(':id/subscribe')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'Subscribe Push Notification',
    type: CreateUpdateSubscriptionSwaggerDto
  })
  @ApiCreatedResponse()
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiUnprocessableEntityResponse()
  @ApiParam({ name: 'id', type: Number })
  async subscribe(@Param('id', ParseIntPipe) id: number, @Body() createSubscriptionDto: CreateUpdateSubscriptionDto) {
    return successResponse(await this.subscriptionsService.createOrUpdate(id, createSubscriptionDto), "Subscription created successfully");
  }

  @Patch(':id/update-subscription')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'Update Subscription',
    type: CreateUpdateSubscriptionSwaggerDto
  })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnprocessableEntityResponse()
  @ApiParam({ name: 'id', type: Number })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateSubscriptionDto: CreateUpdateSubscriptionDto){
    return successResponse(await this.subscriptionsService.update(id, updateSubscriptionDto), "Subscription updated successfully");
  }

  @Delete(':id/delete-subscription')
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnprocessableEntityResponse()
  @ApiParam({ name: 'id', type: Number })
  async delete(@Param('id', ParseIntPipe) id: number){
    return successResponse(await this.subscriptionsService.delete(id), "Subscription deleted successfully");
  }

}
