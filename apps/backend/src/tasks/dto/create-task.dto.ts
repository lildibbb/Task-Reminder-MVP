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

export class CreateTaskDto {
  @ApiProperty({ type: 'string' })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  readonly title: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  readonly description?: string;

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

  @ApiProperty({ type: 'string' })
  @IsString({ message: 'Start date must be a string' })
  @IsNotEmpty({ message: 'Start date must be a string' })
  readonly startDate: string;

  @ApiProperty({ type: 'string' })
  @IsString({ message: 'Due date must be a string' })
  @IsNotEmpty({ message: 'Due date must be a string' })
  readonly dueDate: string;

  @ApiProperty({ type: 'number', required: false })
  @Type(() => Number)
  @IsNotEmpty({ message: 'assignee Id cannot be empty' })
  readonly assigneeId: number;

  @ApiProperty({ type: 'number', required: false })
  @Type(() => Number)
  @IsNumber(undefined, { message: 'Verifier Id must be a number' })
  @IsNotEmpty({ message: 'Verifier Id must be a number' })
  readonly verifierId: number;

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

export class CreateTaskSwaggerDto extends CreateTaskDto {
  @ApiProperty({
    type: 'array', // Indicate an array
    items: { type: 'string', format: 'binary' }, // Each item is a binary file
    required: false,
  })
  @IsOptional()
  readonly file?: Express.Multer.File[]; // Change to array
}
