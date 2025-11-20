import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Status } from '../enums/status.enum';

export class CreateUserDto {
  @ApiProperty({ type: 'string' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one special character, one uppercase letter, one lowercase letter, and one number',
  })
  @IsString({ message: 'Invalid password format' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  readonly password: string;

  @ApiProperty({ type: 'string', nullable: true })
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'Username can only contain letters, numbers, dots, underscores, and hyphens',
  })
  @IsString({ message: 'Invalid username format' })
  @IsOptional()
  readonly username?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString({ message: 'Invalid token format' })
  @IsOptional()
  readonly token: string;

  @ApiProperty({ type: 'string' })
  @IsString({ message: 'Invalid name format' })
  @IsNotEmpty({ message: 'Name cannot be empty' }) //REMINDER: maybe set user need to have name so in other page can display name
  readonly name: string;

  @ApiProperty({ enum: Status })
  @IsEnum(Status, { message: 'Invalid status' })
  readonly status: Status = Status.ACTIVE;
}

export class CreateUserSwaggerDto extends CreateUserDto {}
