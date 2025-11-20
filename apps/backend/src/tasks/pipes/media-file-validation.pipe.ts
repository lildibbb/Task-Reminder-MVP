import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  UnprocessableEntityException,
} from '@nestjs/common';

function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

@Injectable()
export class MediaFileValidationPipe implements PipeTransform {
  private readonly maxSizeInBytes: number = 50 * 1024 * 1024; // 50MB limit

  transform(
    value: Express.Multer.File | Express.Multer.File[] | undefined,
    metadata: ArgumentMetadata,
  ) {
    const fieldName = metadata.data || 'file';

    // we return null here because validation is done in dto
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return null;
    }

    const files = Array.isArray(value) ? value : [value];

    // Validate each file
    for (const file of files) {
      if (!file) continue; // skip null file

      // Check MIME type (allow image/*, video/*, or application/pdf)
      const allowedTypesRegex =
        /^(image\/[a-zA-Z0-9+.-]+|video\/[a-zA-Z0-9+.-]+|application\/pdf)$/;
      if (!file.mimetype || !allowedTypesRegex.test(file.mimetype)) {
        throw new UnprocessableEntityException([
          {
            property: fieldName,
            constraints: {
              mimeType: `Invalid file type: ${file.mimetype || 'unknown'}. Only image, video, and PDF types are allowed.`,
            },
          },
        ]);
      }

      // Check file size
      if (file.size === undefined || file.size > this.maxSizeInBytes) {
        throw new UnprocessableEntityException([
          {
            property: fieldName,
            constraints: {
              maxSize: `File size (${file.size !== undefined ? formatBytes(file.size) : 'unknown'}) exceeds the limit of ${formatBytes(this.maxSizeInBytes)}`,
            },
          },
        ]);
      }
    }

    // Return the array of files if all pass validation
    return files;
  }
}
