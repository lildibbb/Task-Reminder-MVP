import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  Req,
  ParseIntPipe,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { apiPrefix } from 'src/constant/apiPrefix';

import {
  CreateProjectDto,
  CreateProjectSwaggerDto,
} from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
import { successResponse } from 'src/helper/response';
import {
  UpdateProjectDTO,
  UpdateProjectSwaggerDTO,
} from './dto/update-project.dto';

@ApiTags('Projects')
@Controller(apiPrefix + 'projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-project')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBearerAuth()
  @ApiBody({
    description: 'Create Project',
    type: CreateProjectSwaggerDto,
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiCreatedResponse()
  @ApiUnprocessableEntityResponse()
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    const result = await this.projectsService.create(
      createProjectDto,
      req.user.userId,
    );

    return successResponse(
      result,

      'Project created successfully',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/update-project')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBearerAuth()
  @ApiBody({
    description: 'Update Project',
    type: UpdateProjectSwaggerDTO,
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    type: 'number',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDTO: UpdateProjectDTO,
    @Request() req,
  ) {
    return successResponse(
      await this.projectsService.update(id, updateProjectDTO, req.user.userId),
      'Project updated successfully',
    );
  }

  // TODO: implement audit log OR soft delete in db (update deletedAt column only)
  @UseGuards(JwtAuthGuard)
  @Delete(':id/delete-project')
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    type: Number,
  })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return successResponse(
      await this.projectsService.delete(id, req.user.userId),
      'Project deleted successfully',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  async getAllProjects(@Request() req) {
    // PENDING: {TEST} Get all projects the user is involved in (either as creator or member)
    return successResponse(
      await this.projectsService.getAllProjects(req.user.userId),
      'Get all projects successfully',
    );
  }
}
