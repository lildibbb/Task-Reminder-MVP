import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Status } from 'src/users/enums/status.enum';
import { Cache } from 'cache-manager';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('auth.jwtSecretKey') || '',
      passReqToCallback: true,
    });
  }

  // Using the simplified NestJS pattern
  async validate(req: Request, payload: any) {
    const userAccessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!userAccessToken) {
      throw new UnauthorizedException('Access token is missing');
    }

    // Check if the access token is blacklisted
    const blocklistKey = `${this.configService.get('cache_name.accessTokenBlocklist')}:${userAccessToken}`;

    const isBlockedToken = await this.cacheManager.get(blocklistKey);

    if (isBlockedToken) {
      throw new UnauthorizedException('Blacklisted access token');
    }

    // Fetch the user from the database
    const user = await this.usersService.findOneOrFailByID(payload.sub);

    // Check if the user is inactive/suspended
    if (user.status !== Status.ACTIVE) {
      throw new ForbiddenException('Inactive account');
    }

    // Return the user object or relevant data
    return {
      userId: payload.sub,
      roles: payload.roles,
    };
  }
}
