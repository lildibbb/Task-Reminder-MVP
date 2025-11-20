import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateEmailDto } from './dto/create-email.dto';

@Injectable()
export class SendEmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(createEmailDto: CreateEmailDto) {
    const { email, subject, html } = createEmailDto;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        html: html,
      });
      return { message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new UnprocessableEntityException('Failed to send email');
    }
  }
}
