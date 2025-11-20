import { v4 as uuidv4 } from 'uuid';
import { UnprocessableEntityException } from '@nestjs/common';
import { Storage } from '../storage/storage';

/**
 * Uploads files to S3 and returns a map of original filenames to S3 URLs
 */
export async function uploadFilesToS3(
  files: Express.Multer.File[],
  basePath: string,
  diskName: string,
): Promise<{ [key: string]: string }> {
  const fileUrlMap: { [key: string]: string } = {};

  if (!files || files.length === 0) {
    return fileUrlMap;
  }

  for (const file of files) {
    const s3Key = basePath + uuidv4() + '_' + file.originalname;

    try {
      const fileData = await Storage.disk(diskName).put(s3Key, file.buffer);

      if (fileData && fileData.url) {
        fileUrlMap[file.originalname] = fileData.url;
      } else {
        throw new UnprocessableEntityException(
          `Failed to get S3 URL for file: ${file.originalname}`,
        );
      }
    } catch (error) {
      console.error(`Original S3 error for ${file.originalname}:`, error);
      throw new UnprocessableEntityException(
        `Failed to upload file: ${file.originalname}`,
      );
    }
  }

  return fileUrlMap;
}
