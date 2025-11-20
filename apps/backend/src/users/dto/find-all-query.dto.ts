import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindAllUsersQueryDto {
  @ApiProperty({
    required: false,
    type: 'string',
    description: 'Search by name, username, or email',
  })
  @IsString()
  @IsOptional()
  readonly search?: string;

  @ApiProperty({
    required: false,
    type: 'number',
    description: 'Page number for pagination',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  readonly page?: number = 1;

  @ApiProperty({
    required: false,
    type: 'number',
    description: 'Number of users per page',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  readonly perPage?: number = 10;

  @ApiProperty({
    required: false,
    type: 'string',
    description: 'Sort by field',
    enum: ['name', 'username', 'email'],
  })
  @IsString()
  @IsIn(['name', 'username', 'email'])
  @IsOptional()
  readonly sortBy?: 'name' | 'username' | 'email' = 'name';

  @ApiProperty({
    required: false,
    type: 'string',
    description: 'Sort direction',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsIn(['asc', 'desc'])
  @IsOptional()
  readonly sortDirection?: 'asc' | 'desc' = 'asc';
}
