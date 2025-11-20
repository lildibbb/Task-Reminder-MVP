import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ type: 'string' })
  @IsString({ message: 'Role name must be a string' })
  @IsNotEmpty({ message: 'Role name must not be empty' })
  readonly name: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString({ message: 'Role description must be a string' })
  @IsOptional()
  readonly description: string;
}

export class UpdateRoleSwaggerDto extends UpdateRoleDto {}
