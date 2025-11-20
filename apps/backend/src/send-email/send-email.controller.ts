import { successResponse } from 'src/helper/response';
import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SendEmailService } from './send-email.service';
import { CreateEmailDto, CreateEmailSwaggerDto } from './dto/create-email.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { apiPrefix } from 'src/constant/apiPrefix';

@Controller(apiPrefix + 'send-email')
export class SendEmailController {
  constructor(private readonly sendEmailService: SendEmailService) {}
  // TODO : *Critical* potential abuse of email system if no Guards
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @Post('')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'Send Email',
    type: CreateEmailSwaggerDto,
  })
  @ApiOkResponse()
  @ApiUnprocessableEntityResponse()
  @ApiUnauthorizedResponse()
  async sendEmail(@Body() createEmailDto: CreateEmailDto) {
    return successResponse(
      this.sendEmailService.sendEmail(createEmailDto),
      'Email sent successfully',
    );
  }
}
