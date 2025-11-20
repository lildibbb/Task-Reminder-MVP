import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  readonly email: string;
}

export class ForgotPasswordSwaggerDTO extends ForgotPasswordDto {}
