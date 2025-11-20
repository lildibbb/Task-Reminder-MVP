import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ type: 'string' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one special character, one uppercase letter, one lowercase letter, and one number',
  })
  @IsString({ message: 'Invalid password format' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  readonly password: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString({ message: 'Invalid token format' })
  @IsOptional()
  readonly token: string;
}

export class ResetPasswordSwaggerDto extends ResetPasswordDto {}
