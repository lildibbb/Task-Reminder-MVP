import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  // @ApiProperty({ type: 'number' })
  // @IsNumber({}, { message: 'Task ID must be a number' })
  // @IsNotEmpty({ message: 'Task ID cannot be empty' })
  // readonly taskId: number;

  @ApiProperty({ type: 'string' })
  @IsString({ message: 'Comment content must be a string' })
  @IsNotEmpty({ message: 'Comment content cannot be empty' })
  readonly commentContent: string;

  @ApiProperty({ type: 'number' })
  @IsNumber(undefined, { message: 'Parent comment ID must be a number' })
  @Type(() => Number)
  @IsOptional()
  readonly parentCommentId?: number;

  @ApiProperty({ type: 'string' })
  @IsString({ message: 'Comment type must be a string' })
  @IsOptional()
  readonly type?: string;

  // @ApiProperty({ type: 'number' })
  // @IsNumber({}, { message: 'User ID must be a number' })
  // @IsNotEmpty({ message: 'User ID cannot be empty' })
  // readonly userId: number;
}

export class CreateCommentSwaggerDto extends CreateCommentDto {}
