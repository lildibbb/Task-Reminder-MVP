import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Status } from '../enums/status.enum';
import { UserType } from '../enums/user-type';
export class UpdateUserDto {
  @ApiProperty({ type: 'string', required: false })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  email?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString({ message: 'Invalid username format' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  readonly username?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString({ message: 'Invalid name format' })
  @IsOptional()
  readonly name?: string;

  @ApiProperty({ enum: Status, required: false })
  @IsEnum(Status, { message: 'Invalid status' })
  @IsOptional()
  readonly status?: Status;

  @ApiProperty({ enum: UserType, required: false })
  @IsEnum(UserType, { message: 'Invalid user type' })
  @IsOptional()
  readonly userType?: UserType;
}
export class UpdateUserSwaggerDto extends UpdateUserDto {}
