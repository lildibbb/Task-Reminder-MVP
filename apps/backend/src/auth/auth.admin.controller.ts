import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Res,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { apiPrefix } from 'src/constant/apiPrefix';
import { UserType } from 'src/users/enums/user-type';
import e, { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { loginSwaggerDto } from './dto/login.dto';

import { successResponse } from 'src/helper/response';

import { LocalAuthGuard } from './guards/local-auth.guard';
import { Token } from './enums/token.enums';
import { cookieExtractor } from 'src/helper/cookieExtrator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

//TODO: implement user type guard for admin and user instead of using role in jwt payload
@ApiTags('Admin Authentication')
@Controller(apiPrefix + UserType.ADMIN + '/auth')
export class AuthAdminController {
  constructor(private readonly authService: AuthService) {}

  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // @ApiConsumes('application/x-www-form-urlencoded')
  // @ApiBody({
  //   description: 'Login',
  //   type: loginSwaggerDto,
  // })
  // @ApiOkResponse()
  // @ApiNotFoundResponse()
  // @ApiUnauthorizedResponse()
  // async login(@Request() req, @Res({ passthrough: true }) res: Response) {
  //   const tokenResponse = await this.authService.login(req.user);
  //
  //   await this.authService.setBearerAndCookie(
  //     res,
  //     tokenResponse.access_token,
  //     tokenResponse.refresh_token,
  //   );
  //
  //   return successResponse(tokenResponse, 'Login successful');
  // }
  //
  // @UseGuards(JwtAuthGuard)
  // @Post('logout')
  // @ApiOkResponse()
  // @ApiBearerAuth()
  // @ApiConsumes('application/x-www-form-urlencoded')
  // async logout(@Request() req) {
  //   return successResponse(
  //     await this.authService.logout(
  //       req.user,
  //       req.headers.authorization.replace('Bearer ', ''),
  //     ),
  //     'Logout successful',
  //   );
  // }
  //
  // @UseGuards(JwtRefreshGuard)
  // @Post('refresh')
  // @ApiConsumes('application/x-www-form-urlencoded')
  // @ApiBearerAuth()
  // @ApiOkResponse()
  // async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
  //   try {
  //     // Generate new tokens using the validated user from req.user
  //     const tokenResponse = await this.authService.refreshTokens(
  //       req.user.refreshToken,
  //     );
  //
  //     // Set the new tokens in the response (Bearer token and refresh token cookie)
  //     await this.authService.setBearerAndCookie(
  //       res,
  //       tokenResponse.access_token,
  //       tokenResponse.refresh_token,
  //     );
  //
  //     return successResponse(tokenResponse, 'Tokens refreshed successfully');
  //   } catch (error) {
  //     throw new UnauthorizedException('Invalid refresh token');
  //   }
  // }
  //
  // @Get('/test-extract-cookie')
  // async test(@Request() req) {
  //   const extract = { token: cookieExtractor(req, Token.REFRESH_TOKEN) };
  //
  //   console.log(extract, 'extract');
  //   return successResponse(extract, 'testing successfully');
  // }
}
