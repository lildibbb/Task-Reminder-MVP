import {
  DiskOptions,
  StorageDriver,
  FileMetadataResponse,
  PutFileResponse,
  RenameFileResponse,
  UploadPartResponse,
  ListObjectsResponse,
} from '../interfaces';
import { join } from 'path';
import fs from 'fs';
import * as fsExtra from 'fs-extra';
import { BadGatewayException } from '@nestjs/common';
import { Readable } from 'stream';
import { glob } from 'glob';

export class Local implements StorageDriver {
  constructor(
    private disk: string,
    private config: DiskOptions,
  ) {}

  /**
   * Put file content to the path specified.
   *
   * @param path
   * @param fileContent
   */
  async put(filePath: string, fileContent: any): Promise<PutFileResponse> {
    if (this.config.visibility === 'public') {
      return this.putPublic(filePath, fileContent);
    }

    const res = await fsExtra.outputFile(
      join(this.config.basePath || '', filePath),
      fileContent,
    );
    return { path: join(this.config.basePath || '', filePath), url: '' };
  }

  /**
   * Put file content to the path specified.
   *
   * @param path
   * @param fileContent
   */
  async putPublic(
    filePath: string,
    fileContent: any,
  ): Promise<PutFileResponse> {
    const res = await fsExtra.outputFile(
      join(this.config.publicPath || '', filePath),
      fileContent,
    );
    return {
      path: join(this.config.publicPath || '', filePath),
      url: this.url(filePath),
    };
  }

  /**
   * Initiates a multipart upload and returns an upload ID (This function only supported by AWS S3 SDK since it can't keep track UploadId)
   *
   * @param path
   */
  async createMultipartUpload(path: string): Promise<string> {
    throw new BadGatewayException(
      'Multipart upload does not supported by local storage',
    );
  }

  /**
   * Uploads a file content by part (This function only supported by AWS S3 SDK since it can't keep track UploadId)
   *
   * @param path
   * @param fileContent
   * @param uploadId
   * @param partNumber
   */
  async uploadByPart(
    path: string,
    fileContent: any,
    uploadId: string,
    partNumber: number,
  ): Promise<UploadPartResponse> {
    throw new BadGatewayException(
      'Multipart upload does not supported by local storage',
    );
  }

  /**
   * Complete the multipart upload (This function only supported by AWS S3 SDK since it can't keep track UploadId)
   *
   * @param path
   * @param uploadId
   * @param multipartUpload
   */ F;
  async completeMultipartUpload(
    path: string,
    uploadId: string,
    multipartUpload: UploadPartResponse[],
  ): Promise<PutFileResponse> {
    throw new BadGatewayException(
      'Multipart upload does not supported by local storage',
    );
  }

  /**
   * Abort the multipart upload (if multipart upload failed) (This function only supported by AWS S3 SDK since it can't keep track UploadId)
   *
   * @param path
   * @param uploadId
   */
  async abortMultipartUpload(path: string, uploadId: string): Promise<boolean> {
    throw new BadGatewayException(
      'Multipart upload does not supported by local storage',
    );
  }

  /**
   * Get file stored at the specified path.
   *
   * @param path
   */
  async get(filePath: string): Promise<Buffer | null> {
    const exists = await this.exists(filePath);
    if (!exists) {
      return null;
    }

    if (this.config.visibility === 'public') {
      return await fsExtra.readFile(
        join(this.config.publicPath || '', filePath),
      );
    }

    const res = await fsExtra.readFile(
      join(this.config.basePath || '', filePath),
    );

    return res;
  }

  /**
   * Get file stream stored at the specified path.
   *
   * @param path
   */
  getStream(filePath: string): Readable | null {
    try {
      const fullPath =
        this.config.visibility === 'public'
          ? join(this.config.publicPath || '', filePath)
          : join(this.config.basePath || '', filePath);

      // Synchronously check if the file exists before creating a stream
      if (!fs.existsSync(fullPath)) {
        return null;
      }

      // Note: createReadStream can still emit an 'error' event later
      // if issues occur after the stream is created (e.g., permissions).
      // The consumer of the stream should handle these events.
      return fs.createReadStream(fullPath);
    } catch (e) {
      // Catch errors during path construction or initial sync checks
      // Consider logging the error here if a logger is available
      // console.error(`Error creating read stream for ${filePath}`, e);
      return null;
    }
  }

  /**
   * List all files stored at the specified path.
   *
   * @param path
   */
  async listObjects(path: string): Promise<ListObjectsResponse[]> {
    try {
      const exists = await this.exists(path);
      if (!exists) {
        return [];
      }

      const fullPath =
        this.config.visibility === 'public'
          ? join(this.config.publicPath || '', path)
          : join(this.config.basePath || '', path);

      const results = await glob.sync(fullPath + '/**/*');
      const newResults: ListObjectsResponse[] = [];
      for (const result of results) {
        const fileStat = fs.statSync(result);
        // Skip if the path is folder
        // Because result of glob is included folder directory too,
        // instead of file directory only
        if (fileStat.isDirectory()) continue;
        newResults.push({
          Key: result,
          LastModified: fileStat.mtime,
          Size: fileStat.size,
        });
      }

      return newResults;
    } catch (e) {
      return [];
    }
  }

  /**
   * Get object's metadata
   * @param path
   */
  async meta(filePath: string): Promise<FileMetadataResponse> {
    let path = join(this.config.basePath || '', filePath);
    if (this.config.visibility === 'public') {
      path = join(this.config.publicPath || '', filePath);
    }

    const res = await fsExtra.stat(path);
    return {
      path,
      contentLength: res.size,
      lastModified: res.mtime,
    };
  }

  /**
   * Get Signed Urls
   * @param path
   */
  signedUrl(filePath: string, expire = 10): string {
    return '';
  }

  /**
   * Check if file exists at the path.
   *
   * @param path
   */
  async exists(filePath: string): Promise<boolean> {
    if (this.config.visibility === 'public') {
      return fsExtra.pathExists(join(this.config.publicPath || '', filePath));
    }

    return fsExtra.pathExists(join(this.config.basePath || '', filePath));
  }

  /**
   * Check if file is missing at the path.
   *
   * @param path
   */
  async missing(filePath: string): Promise<boolean> {
    return !(await this.exists(filePath));
  }

  /**
   * Get URL for path mentioned.
   *
   * @param path
   */
  url(fileName: string) {
    if (
      this.config.visibility === 'public' &&
      this.config.baseUrl &&
      fileName
    ) {
      return `${this.config.baseUrl}/${fileName}`;
    }

    return '';
  }

  /**
   * Delete file at the given path.
   *
   * @param path
   */
  async delete(filePath: string): Promise<boolean> {
    const exists = await this.exists(filePath);
    if (!exists) {
      return false;
    }

    try {
      if (this.config.visibility === 'public') {
        await fsExtra.remove(join(this.config.publicPath || '', filePath));
      } else {
        await fsExtra.remove(join(this.config.basePath || '', filePath));
      }
    } catch (e) {}
    return true;
  }

  /**
   * Delete files in batches from the given paths.
   *
   * @param paths
   */
  async deleteInBatches(paths: string[]): Promise<boolean> {
    const totalPaths = paths.length;
    const batchSize = 1000;

    for (let i = 0; i < totalPaths; i += batchSize) {
      const batch = paths.slice(i, i + batchSize);

      for (const filePath of batch) {
        const exists = await this.exists(filePath);
        if (!exists) {
          continue;
        }

        try {
          if (this.config.visibility === 'public') {
            await fsExtra.remove(join(this.config.publicPath || '', filePath));
          } else {
            await fsExtra.remove(join(this.config.basePath || '', filePath));
          }
        } catch (error) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Delete file at the given path.
   *
   * @param path
   */
  async deletePath(path: string): Promise<boolean> {
    return this.delete(path);
  }

  /**
   * Copy file internally in the same disk
   *
   * @param path
   * @param newPath
   */
  async copy(path: string, newPath: string): Promise<RenameFileResponse> {
    const res = await fsExtra.copy(
      join(this.config.basePath || '', path),
      join(this.config.basePath || '', newPath),
      { overwrite: true },
    );
    return {
      path: join(this.config.basePath || '', newPath),
      url: this.url(newPath),
    };
  }

  /**
   * Move file internally in the same disk
   *
   * @param path
   * @param newPath
   */
  async move(path: string, newPath: string): Promise<RenameFileResponse> {
    await this.copy(path, newPath);
    await this.delete(path);
    return {
      path: join(this.config.basePath || '', newPath),
      url: this.url(newPath),
    };
  }

  /**
   * Get instance of driver's client.
   */
  getClient(): null {
    return null;
  }

  /**
   * Get config of the driver's instance.
   */
  getConfig(): Record<string, any> {
    return this.config;
  }
}
