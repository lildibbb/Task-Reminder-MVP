import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { apiPrefix } from '../constant/apiPrefix';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { loginSwaggerDto } from './dto/login.dto';
import { Response } from 'express';
import { instanceToPlain } from 'class-transformer';
import { successResponse } from '../helper/response';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import {
  ForgotPasswordDto,
  ForgotPasswordSwaggerDTO,
} from './dto/forgot-password.dto';
import { ResetPasswordSwaggerDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller(apiPrefix + 'auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'Login',
    type: loginSwaggerDto,
  })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const tokenResponse = await this.authService.login(req.user);

    await this.authService.setBearerAndCookie(
      res,
      tokenResponse.access_token,
      tokenResponse.refresh_token,
    );
    const new_data = {
      tokenResponse,
      user: instanceToPlain(req.user),
    };
    return successResponse(new_data, 'Login successful');
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  async logout(@Request() req) {
    return successResponse(
      await this.authService.logout(
        req.user,
        req.headers.authorization.replace('Bearer ', ''),
      ),
      'Logout successful',
    );
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBearerAuth()
  @ApiOkResponse()
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    try {
      // Generate new tokens using the validated user from req.user
      const tokenResponse = await this.authService.refreshTokens(
        req.user.refreshToken,
      );

      // Set the new tokens in the response (Bearer token and refresh token cookie)
      await this.authService.setBearerAndCookie(
        res,
        tokenResponse.access_token,
        tokenResponse.refresh_token,
      );

      return successResponse(tokenResponse, 'Tokens refreshed successfully');
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOkResponse()
  @ApiNotFoundResponse()
  async myProfile(@Request() req) {
    return successResponse(
      await this.authService.getProfile(req.userId),
      'Profile fetched successfully',
    );
  }

  @Post('forgot-password')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'Forgot Password',
    type: ForgotPasswordSwaggerDTO,
  })
  @ApiOkResponse()
  @ApiUnprocessableEntityResponse()
  async requestForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    console.log('Forgot password request received:', forgotPasswordDto);
    return successResponse(
      await this.authService.requestForgotPassword(forgotPasswordDto),
      'Request for forgot password successful',
    );
  }

  @Put('reset-password')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'Reset Password',
    type: ResetPasswordSwaggerDto,
  })
  @ApiOkResponse()
  @ApiCreatedResponse()
  @ApiUnauthorizedResponse()
  @ApiUnprocessableEntityResponse()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordSwaggerDto) {
    return successResponse(
      await this.authService.resetPassword(resetPasswordDto),
      'Reset Password successful',
    );
  }
}
