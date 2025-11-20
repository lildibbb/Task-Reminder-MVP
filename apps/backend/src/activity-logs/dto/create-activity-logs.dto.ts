import { ActionType } from '../enums/action-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateActivityLogsDto {
  @ApiProperty({ type: 'number' })
  @IsNumber({}, { message: 'Task ID must be a number' })
  @IsNotEmpty({ message: 'Task ID cannot be empty' })
  readonly taskId: number;

  @ApiProperty({ type: 'number' })
  @IsNumber({}, { message: 'User ID must be a number' })
  @IsNotEmpty({ message: 'User ID cannot be empty' })
  readonly userId: number;

  @ApiProperty({ enum: ActionType })
  @IsEnum(ActionType, { message: 'Action must be a valid enum' })
  readonly actionType: ActionType;

  @ApiProperty({ type: 'string' })
  @IsString({ message: 'Action details must be a string' })
  @IsNotEmpty({ message: 'Action details cannot be empty' })
  readonly actionDetails: string;
}

export class CreateActivityLogsSwaggerDto extends CreateActivityLogsDto {}
