import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UploadedFiles,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { apiPrefix } from '../constant/apiPrefix';
import { CommentsService } from './comments.service';
import {
  CreateCommentDto,
  CreateCommentSwaggerDto,
} from './dto/create-comment.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaFileValidationPipe } from '../tasks/pipes/media-file-validation.pipe';
import { successResponse } from '../helper/response';

@ApiTags('Comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller(apiPrefix + 'comments')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  @Post(':taskId/create-comment')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'Create Comment',
    type: CreateCommentSwaggerDto,
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiCreatedResponse()
  @ApiParam({ name: 'taskId', type: Number })
  @UseInterceptors(FilesInterceptor('file'))
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Request() req,
    @UploadedFiles(MediaFileValidationPipe) files?: Express.Multer.File[],
  ) {
    console.log('userID: ', req.user.userId);
    const result = await this.commentService.create(
      taskId,
      createCommentDto,
      req.user.userId,
      files,
    );
    console.log('result ', result);
    return successResponse(result, 'Comment created successfully');
  }

  // @Get(':taskId/get-comments')
  // @ApiFoundResponse()
  // @ApiNotFoundResponse()
  // @ApiOkResponse()
  // @ApiUnauthorizedResponse()
  // @ApiParam({ name: 'taskId', type: Number })
  // async getAll(@Param('taskId', ParseIntPipe) taskId: number) {
  //   const result = await this.commentService.find(taskId);
  //   return successResponse(result, 'Comments fetched successfully');
  // }
}
