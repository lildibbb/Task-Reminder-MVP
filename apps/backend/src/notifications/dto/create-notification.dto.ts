import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationType } from '../enums/notification.enum';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
  @ApiProperty({ type: 'number' })
  @Type(() => Number)
  @IsNumber({}, { message: 'User ID must be a number' })
  @IsNotEmpty({ message: 'User ID cannot be empty' })
  readonly userId: number;

  @ApiProperty({ type: 'string' })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  readonly title: string;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  @IsString({ message: 'content must be a string' })
  @IsOptional()
  readonly content?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    properties: {},
    nullable: true,
  })
  @IsObject({ message: 'data must be an object' })
  @IsOptional()
  readonly data?: Record<string, any>;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'object' },
    nullable: true,
  })
  @IsArray({ message: 'action must be an array' })
  @IsOptional()
  readonly action?: Record<string, any>[];

  @ApiProperty({ type: 'boolean' })
  @Type(() => Boolean)
  @IsBoolean({ message: 'isPushNotification must be a boolean' })
  @IsNotEmpty({ message: 'isPushNotification cannot be empty' })
  readonly isPushNotification: boolean;

  @ApiProperty({
    enum: NotificationType,
  })
  @IsEnum(NotificationType, { message: 'Invalid notification type' })
  readonly notificationType: NotificationType;
}

export class CreateNotificationSwaggerDto extends CreateNotificationDto {}
