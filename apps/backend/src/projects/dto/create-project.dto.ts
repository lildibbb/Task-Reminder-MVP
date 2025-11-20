import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VisibilityType } from '../enums/visibility.enum';

export class CreateProjectDto {
  @ApiProperty({ type: 'string' })
  @IsString({ message: 'Project name must be a string' })
  @IsNotEmpty({ message: 'Project name cannot be empty' })
  readonly name: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString({ message: 'Project description must be a string' })
  @IsOptional()
  readonly description?: string;

  // @ApiProperty({ type: 'string' })
  // @IsString({ message: 'Slug must be a string' })
  // @IsNotEmpty({ message: 'Slug cannot be empty' })
  // readonly slug: string; //TODO: later on add this column in table

  // @ApiProperty({ enum: VisibilityType })
  // @IsEnum(VisibilityType, {
  //   message:
  //     'Visibility must be one of the following: PUBLIC, PRIVATE, INTERNAL', // Internal for Group (not yet implemented)
  // })
  // readonly visibility: VisibilityType; // TODO: later on add this column in table
}

export class CreateProjectSwaggerDto extends CreateProjectDto {}
