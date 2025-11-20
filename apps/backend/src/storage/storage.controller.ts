import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Storage } from './storage';
import { FileInterceptor } from '@nestjs/platform-express';
import { ListObjectsResponse } from './interfaces';

@Controller('storage')
export class StorageController {
  // @Post()
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFileToS3(@UploadedFile() file: Express.Multer.File) {
  //   return Storage.disk('default').put(file.originalname, file.buffer);
  // }
  // @Post('/public')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFileToS3Public(@UploadedFile() file: Express.Multer.File) {
  //   return Storage.disk('image').put(file.originalname, file.buffer);
  // }
  // @Post('/local')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFileToLocal(@UploadedFile() file: Express.Multer.File) {
  //   return Storage.disk('local').put(file.originalname, file.buffer);
  // }
  // @Post('/local/public')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFileToLocalPublic(@UploadedFile() file: Express.Multer.File) {
  //   return Storage.disk('local_public').put(file.originalname, file.buffer);
  // }
  // @Get('/local/list/:path')
  // async findOneLocal(@Param('path') path: string): Promise<ListObjectsResponse[]> {
  //   const results = await Storage.disk('local').listObjects(path);
  //   return results;
  // }
  // @Get('/local/public/list/:path')
  // async findOneLocalPublic(
  //   @Param('path') path: string,
  // ): Promise<ListObjectsResponse[]> {
  //   const results = await Storage.disk('local_public').listObjects(path);
  //   return results;
  // }
  // @Get('/local/:path')
  // async findOneLocal(@Param('path') path: string): Promise<StreamableFile> {
  //   const file = await Storage.disk('local').get(path);
  //   if (!file) {
  //     throw new NotFoundException('File not found');
  //   }
  //   return new StreamableFile(file);
  // }
  // @Get('/local/public/:path')
  // async findOneLocalPublic(
  //   @Param('path') path: string,
  // ): Promise<StreamableFile> {
  //   const file = await Storage.disk('local_public').get(path);
  //   if (!file) {
  //     throw new NotFoundException('File not found');
  //   }
  //   return new StreamableFile(file);
  // }
  // @Get(':path')
  // async findOne(@Param('path') path: string): Promise<StreamableFile> {
  //   const file = await Storage.disk('default').get(path);
  //   if (!file) {
  //     throw new NotFoundException('File not found');
  //   }
  //   return new StreamableFile(file);
  // }
  // @Get('/local/url/:filename')
  // findOneLocalFileUrl(@Param('filename') filename: string) {
  //   const fileUrl = Storage.disk('local_public').url(filename);
  //   if (!fileUrl) {
  //     throw new NotFoundException('File not found');
  //   }
  //   return fileUrl;
  // }
  // @Get(':path/metadata')
  // async findOneMetadata(@Param('path') path: string) {
  //   const metadata = await Storage.disk('default').meta(path);
  //   if (!metadata) {
  //     throw new NotFoundException('File not found');
  //   }
  //   return metadata;
  // }
  // @Delete(':path')
  // remove(@Param('path') path: string) {
  //   return Storage.disk('default').delete(path);
  // }
  // @Delete('/local/:path')
  // removeLocal(@Param('path') path: string) {
  //   return Storage.disk('local').delete(path);
  // }
  // @Delete('/local/public/:path')
  // removeLocalPublic(@Param('path') path: string) {
  //   return Storage.disk('local_public').delete(path);
  // }
}
