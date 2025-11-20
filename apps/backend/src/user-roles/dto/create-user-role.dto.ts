import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { create } from 'domain';
import e from 'express';

export class CreateUserRoleDto {
  @ApiProperty({ type: 'number' })
  @IsNumber(undefined, { message: 'Invalid user id format' })
  @IsNotEmpty({
    message: 'User id cannot be empty',
  })
  readonly userId: number;

  @ApiProperty({ type: 'number' })
  @IsNumber(undefined, { message: 'Invalid role id format' })
  @IsNotEmpty({
    message: 'Role id cannot be empty',
  })
  readonly roleId: number;
}

export class CreateUserRoleSwaggerDto extends CreateUserRoleDto {}
