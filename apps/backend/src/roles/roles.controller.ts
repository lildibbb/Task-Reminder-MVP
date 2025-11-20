import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
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
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { apiPrefix } from 'src/constant/apiPrefix';
import { successResponse } from 'src/helper/response';
import { CreateRoleDto, CreateRoleSwaggerDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';
import { UpdateRoleDto, UpdateRoleSwaggerDto } from './dto/update-role.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller(apiPrefix + 'roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('create-role')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'Create Roles',
    type: CreateRoleSwaggerDto,
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiCreatedResponse()
  @ApiUnprocessableEntityResponse()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return successResponse(
      this.rolesService.create(createRoleDto),
      'Role created successfully',
    );
  }

  @Patch('update-role/:id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'Update Roles',
    type: UpdateRoleSwaggerDto,
  })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnprocessableEntityResponse()
  @ApiParam({ name: 'id', type: Number })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    console.log('id for param: ', id);
    return successResponse(
      this.rolesService.update(id, updateRoleDto),
      'Role updated successfully',
    );
  }

  @Get('get-all-roles')
  @ApiFoundResponse()
  @ApiNotFoundResponse()
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  async getAll() {
    return successResponse(
      await this.rolesService.getAll(),
      'Roles fetched successfully',
    );
  }

  @Delete('delete-role/:id')
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: 'id',
    description: 'role ID',
    type: Number,
  })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return successResponse(
      await this.rolesService.delete(id),
      'Role deleted successfully',
    );
  }
}
