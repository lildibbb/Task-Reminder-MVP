import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

class SubscriptionKeysDto {
  @ApiProperty({type: 'string'})
  @IsString({message: 'P256DH must be a string'})
  p256dh: string;

  @ApiProperty({type: 'string'})
  @IsString({message: 'Auth must be a string'})
  auth: string;
}

export class SubscriptionDto {
  @ApiProperty({type: 'string'})
  @IsString({message: 'Endpoint must be a string'})
  endpoint: string;

  @ApiProperty({ type: SubscriptionKeysDto })
  @ValidateNested()
  @Type(() => SubscriptionKeysDto)
  keys: SubscriptionKeysDto;
}

export class CreateUpdateSubscriptionDto {
  @ApiProperty({ type: SubscriptionDto })
  @IsNotEmpty({ message: 'Subscription cannot be empty' })
  @IsObject()
  @ValidateNested()
  @Type(() => SubscriptionDto)
  readonly subscription: SubscriptionDto;

}

export class CreateUpdateSubscriptionSwaggerDto extends CreateUpdateSubscriptionDto {}
