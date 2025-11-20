import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { successResponse } from '../helper/response';
import { CreateUserDto, CreateUserSwaggerDto } from './dto/create-user.dto';
import { ADMIN_GROUP } from './entities/user.entity';
import { UserType } from './enums/user-type';
import { UsersService } from './users.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { apiPrefix } from 'src/constant/apiPrefix';
import { InviteUserDto, InviteUserSwaggerDto } from './dto/invite-user.dto';
import { UpdateUserDto, UpdateUserSwaggerDto } from './dto/update-user.dto';

@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  groups: [ADMIN_GROUP],
})
@Controller(apiPrefix + UserType.ADMIN + '/users')
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create-user')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'Create user',
    type: CreateUserSwaggerDto,
  })
  @ApiCreatedResponse()
  @ApiUnprocessableEntityResponse()
  // @UseInterceptors(FileInterceptor('image')) // For future use if file upload is needed
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.usersService.create(createUserDto);
      return successResponse(result, 'Create user successful');
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  @Get('/all')
  async getAllUsers() {
    const result = await this.usersService.getAllUsers();
    return successResponse(result, 'Get all users successful');
  }

  @Get(':id')
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiFoundResponse()
  @ApiNotFoundResponse()
  @ApiParam({
    name: 'id',
    type: Number,
  })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return successResponse(
      await this.usersService.findOneOrFailByID(id),
      'Get user successful',
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('/invite-user')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'Invite user',
    type: InviteUserSwaggerDto,
  })
  @ApiOkResponse()
  @ApiUnprocessableEntityResponse()
  @ApiUnauthorizedResponse()
  async inviteUser(@Body() inviteUserDto: InviteUserDto) {
    console.log('Invite user called with:', inviteUserDto);
    const result = await this.usersService.inviteUser(inviteUserDto);
    console.log('Invite user result:', result);
    return successResponse(result, 'Invite user successful');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('update-user/:id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    type: UpdateUserSwaggerDto,
    description: 'Update User',
  })
  @ApiOkResponse()
  @ApiUnprocessableEntityResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: Number,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    console.log('id: ', id);
    const result = await this.usersService.update(updateUserDto, id);
    console.log('Update user result: ', result);
    return successResponse(result, 'Update user successful');
  }
}
