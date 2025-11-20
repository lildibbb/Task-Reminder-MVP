import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import Keyv from 'keyv';
import { RolesModule } from 'src/roles/roles.module';
import { UserRolesModule } from 'src/user-roles/user-roles.module';
import { UserEntity } from './entities/user.entity';
import { UsersAdminController } from './users.admin.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({}),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('redis.url');

        return {
          stores: new Keyv({
            store: new KeyvRedis(redisUrl),
            useKeyPrefix: false,
          }),
        };
      },
      inject: [ConfigService],
    }),
    UserRolesModule,
    RolesModule,
  ],
  controllers: [UsersController, UsersAdminController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
