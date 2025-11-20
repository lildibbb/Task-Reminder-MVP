import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { UserType } from '../enums/user-type';

export class InviteUserDto {
  @ApiProperty({ type: 'string' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @Transform(({ value }) => value?.trim())
  readonly email: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString({ message: 'Invalid username format' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  readonly username?: string;

  @ApiProperty({ enum: UserType })
  @IsEnum(UserType, { message: 'Invalid user type' })
  @IsNotEmpty({ message: 'User type cannot be empty' })
  readonly userType: UserType;
}

export class InviteUserSwaggerDto extends InviteUserDto {}
