import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Patch,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
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
} from '@nestjs/swagger';
import { apiPrefix } from 'src/constant/apiPrefix';
import { CreateTaskDto, CreateTaskSwaggerDto } from './dto/create-task.dto';
import { successResponse } from 'src/helper/response';
import { MediaFileValidationPipe } from './pipes/media-file-validation.pipe';
import { UpdateTaskDto, UpdateTaskSwaggerDto } from './dto/update-task.dto';

@ApiTags('Tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller(apiPrefix + 'tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOkResponse()
  @ApiFoundResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  async findAll(@Request() req) {
    return successResponse(
      await this.tasksService.findAll(),
      'Tasks fetched successfully',
    );
  }

  @Get(':userId')
  @ApiOkResponse()
  @ApiFoundResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({ name: 'userId', type: Number })
  async findAllByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return successResponse(
      await this.tasksService.findAllByUserId(userId),
      'Tasks fetched) successfully',
    );
  }

  @Post('create-task')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create Task',
    type: CreateTaskSwaggerDto,
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiCreatedResponse()
  @UseInterceptors(FilesInterceptor('file'))
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req,
    @UploadedFiles(MediaFileValidationPipe) files?: Express.Multer.File[],
  ) {
    console.log('expectedResult', createTaskDto.expectedResult);
    const result = await this.tasksService.create(
      createTaskDto,
      req.user.userId,
      files,
    );

    return successResponse(result, 'Task created successfully');
  }

  @Patch(':taskId/update-task')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update Task',
    type: UpdateTaskSwaggerDto,
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiCreatedResponse()
  @ApiParam({ name: 'taskId', type: Number })
  @UseInterceptors(FilesInterceptor('file'))
  async update(
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
    @Param('taskId', ParseIntPipe) taskId: number,
    @UploadedFiles(MediaFileValidationPipe) files?: Express.Multer.File[],
  ) {
    const result = await this.tasksService.update(
      updateTaskDto,
      taskId,
      req.user.userId,
      files,
    );
    return successResponse(result, 'Task updated successfully');
  }
}
