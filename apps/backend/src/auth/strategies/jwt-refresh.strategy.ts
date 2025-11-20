import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Status } from 'src/users/enums/status.enum';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { cookieExtractor } from 'src/helper/cookieExtrator';
import { Token } from '../enums/token.enums';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => cookieExtractor(req, Token.REFRESH_TOKEN),
      ]),
      secretOrKey: configService.get<string>('auth.jwtRefreshSecretKey') || '',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    // Force user to relogin
    const user = await this.usersService.findOneOrFailByID(payload.sub);

    // Check if the user is inactive/suspended
    if (user.status !== Status.ACTIVE) {
      throw new ForbiddenException('Inactive account');
    }

    const refreshToken = cookieExtractor(req, Token.REFRESH_TOKEN);

    return { ...user, userId: payload.sub, refreshToken };
  }
}
