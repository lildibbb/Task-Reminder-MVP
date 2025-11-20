import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateEmailDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString({ message: 'Invalid subject format' })
  readonly subject?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString({ message: 'Invalid body format' })
  readonly html?: string;
}

export class CreateEmailSwaggerDto extends CreateEmailDto {}
