import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  readonly email: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  readonly password: string;
}

export class loginSwaggerDto extends LoginDto {}
