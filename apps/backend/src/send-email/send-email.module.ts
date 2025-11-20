import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SendEmailController } from './send-email.controller';
import { SendEmailService } from './send-email.service';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('mail.host'),
          port: configService.get('mail.port'),
          secure: false,
          auth: {
            user: configService.get('mail.username'),
            pass: configService.get('mail.password'),
          },
        },
        defaults: {
          from: `"${configService.get('mail.from_name')}" <${configService.get('mail.from_email')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SendEmailController],
  providers: [SendEmailService],
  exports: [SendEmailService],
})
export class SendEmailModule {}
