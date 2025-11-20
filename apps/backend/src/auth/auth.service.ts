import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

//Entity
import { UserEntity } from 'src/users/entities/user.entity';

//Enum
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import ms from 'enhanced-ms';
import { Response } from 'express';
import { Status } from 'src/users/enums/status.enum';
import { JWTPayload, UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { Token } from './enums/token.enums';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  status: Status;
}

interface JwTPayLoad {
  sub: number;
  roles: string[];
}
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache, // here to inject redis cacheManager
  ) {}

  async login(user: UserEntity): Promise<TokenResponse> {
    try {
      const token = await this.generateToken(user);

      const tokenWithStatus = {
        ...token,
        status: user.status,
      };
      return tokenWithStatus;
    } catch (error) {
      console.error('Error generating token:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  // Generate JWT tokens for the user after login
  async generateToken(User: UserEntity) {
    const payload: JwTPayLoad = {
      sub: User.id,
      roles: User.userRoles
        ? User.userRoles.map((userRole) => userRole.role.name)
        : [],
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('auth.jwtSecretKey'),
        expiresIn: this.configService.get('auth.jwtExpiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('auth.jwtRefreshSecretKey'),
        expiresIn: this.configService.get('auth.jwtRefreshExpiresIn'),
      }),
    ]);

    await this.updateRefreshToken(User.id, refreshToken); // Store/overwrite refresh token in Redis cache NOTE: no need to save/update in redis

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  // REMINDER: no need to save refresh token in redis/db, just use the one in the cookie and validate using the guard
  async updateRefreshToken(userId: number, refreshToken: string) {
    const refreshTokenKey = `${this.configService.get('cache.refreshToken')}:${userId}`;
    const refreshTokenExpireIn = ms(
      this.configService.get<string>('auth.jwtRefreshExpiresIn') ?? '7d',
    );

    // overwrite old refresh token in redis cache
    await this.cacheManager.set(
      refreshTokenKey,
      refreshToken,
      refreshTokenExpireIn,
    );
  }

  async refreshTokens(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('auth.jwtRefreshSecretKey'),
    });
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findOneOrFailByID(payload.sub);
    console.log('user', user);

    return await this.login(user);
  }

  async logout(user: UserEntity, accessToken: string) {
    if (!user) throw new UnauthorizedException('Invalid credentials');

    await this.cacheManager.set(
      `${this.configService.get('cache_name.accessTokenBlocklist')}:${accessToken}`,
      accessToken,
      ms(this.configService.get<string>('auth.jwtExpiresIn') ?? '1h'),
    );

    return null;
  }
  // Validate user credentials in the guard before passing the request to the controller
  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = await this.usersService.findOneByEmailWithPassword(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status !== Status.ACTIVE) {
      throw new ForbiddenException('User is inactive');
    }

    const result = await bcrypt.compareSync(loginDto.password, user.password);

    if (!result) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  // this to set bearer token and refresh token in the response header and cookie
  async setBearerAndCookie(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.set('Authorization', `Bearer ${accessToken}`);
    res.set(`X-${Token.REFRESH_TOKEN}`, `Bearer ${refreshToken}`);
    res.cookie(Token.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms(
        this.configService.get<string>('auth.jwtRefreshExpiresIn') ?? '7d',
      ),
    });
  }

  async getProfile(userId: number) {
    return await this.usersService.findOneOrFailByID(userId);
  }

  async requestForgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findOneByEmail(
      forgotPasswordDto.email,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const payload: JWTPayload = {
      sub: forgotPasswordDto.email,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('auth.jwtSecretKey'),
      expiresIn: this.configService.get('auth.jwtInviteExpiresIn'),
    });
    const returnUrl = `${this.configService.get<string>('FRONTEND_URL')}/forgot-password/reset?token=${token}`;

    try {
      await this.cacheManager.set(
        `${this.configService.get<string>('cache.forgotPassword')}:${forgotPasswordDto.email}`,
        token,
        ms(this.configService.get<string>('auth.jwtInviteExpiresIn') ?? '30m'),
      );
      return { token, returnUrl };
    } catch (error) {
      console.error('Error generating forgot password token:', error);
      throw new UnprocessableEntityException(
        'Error generating forgot password token',
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return await this.usersService.resetPassword(resetPasswordDto);
  }
}
