import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';
import { Priority } from '../enums/priority.enum';
import { Type } from 'class-transformer';

export class UpdateTaskDto {
  @ApiProperty({ type: 'string', required: false })
  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  readonly title?: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  readonly description?: string;

  @ApiProperty({ enum: TaskStatus, required: false })
  @IsEnum(TaskStatus, {
    message:
      'Status must be one of the following: new, doing, pending_verification, verification_failed, verified, closed',
  })
  @IsOptional()
  readonly status?: TaskStatus;

  @ApiProperty({ enum: Priority, required: false })
  @IsEnum(Priority, {
    message: 'Priority must be one of the following: high, medium, low',
  })
  @IsOptional()
  readonly priority?: Priority;

  @ApiProperty({ type: 'string', required: false })
  @IsString({ message: 'Expected result must be a string' })
  @IsOptional()
  readonly expectedResult?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString({ message: 'Due date must be a string' })
  @IsOptional()
  readonly dueDate?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString({ message: 'Start date must be a string' })
  @IsOptional()
  readonly startDate?: string;

  @ApiProperty({ type: 'number', required: false })
  @Type(() => Number)
  @IsNumber(undefined, { message: 'Assignee ID must be a number' })
  @IsOptional()
  readonly assigneeId?: number;

  @ApiProperty({ type: 'number', required: false })
  @Type(() => Number)
  @IsNumber(undefined, { message: 'Verifier Id must be a number' })
  @IsOptional()
  readonly verifierId?: number;

  @ApiProperty({ type: 'number', required: false })
  @Type(() => Number)
  @IsNumber(undefined, {
    message: 'Resolve Report(comment) ID must be a number',
  })
  @IsOptional()
  readonly resolvedReportId?: number;

  @ApiProperty({ type: 'boolean', required: false })
  @Type(() => Boolean)
  @IsBoolean({ message: 'isRepeating must be a boolean' })
  @IsOptional()
  readonly isRepeating?: boolean;

  @ApiProperty({ type: 'string', required: false })
  @IsString({ message: 'Repeat frequency must be a string' })
  @IsOptional()
  readonly repeatFrequency?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString({ message: 'Reminder time must be a string' })
  @IsOptional()
  readonly reminderTime?: string;
}

export class UpdateTaskSwaggerDto extends UpdateTaskDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsOptional()
  readonly file?: Express.Multer.File[];
}
