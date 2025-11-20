import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthAdminController } from './auth.admin.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';
import { AuthUserController } from './auth.user.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule,
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
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
  controllers: [AuthController, AuthAdminController, AuthUserController],
  exports: [AuthService],
})
export class AuthModule {}
