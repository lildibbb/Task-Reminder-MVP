// src/helpers/content-processor.helper.ts

import { Logger } from '@nestjs/common';

const logger = new Logger('ContentProcessor');

/**
 * Processes content nodes in a document structure, replacing blob URLs with S3 URLs
 * @param node The current node to process
 * @param fileUrlMap Map of original filenames to their S3 URLs
 * @param fileProcessingState Tracking state for file processing
 */
export function processContentNode(
  node: any,
  fileUrlMap: { [key: string]: string },
  fileProcessingState: {
    files: Express.Multer.File[];
    currentIndex: number;
  },
): void {
  let attributeToUpdate: 'src' | 'url' | null = null;
  let currentBlobUrl: string | null = null;

  // Check for image or video with blob URL
  if (
    (node.type === 'image' || node.type === 'video') &&
    node.attrs?.src &&
    typeof node.attrs.src === 'string' &&
    node.attrs.src.startsWith('blob:')
  ) {
    attributeToUpdate = 'src';
    currentBlobUrl = node.attrs.src;
  }
  // Check for attachment with blob URL
  else if (
    node.type === 'attachment' &&
    node.attrs?.url &&
    typeof node.attrs.url === 'string' &&
    node.attrs.url.startsWith('blob:')
  ) {
    attributeToUpdate = 'url';
    currentBlobUrl = node.attrs.url;
  }

  // If we found a blob URL to update
  if (attributeToUpdate && currentBlobUrl) {
    replaceNodeBlobUrl(
      node,
      attributeToUpdate,
      currentBlobUrl,
      fileUrlMap,
      fileProcessingState,
    );
  }

  // Process child nodes recursively
  if (node.content && Array.isArray(node.content)) {
    for (const childNode of node.content) {
      processContentNode(childNode, fileUrlMap, fileProcessingState);
    }
  }
}

/**
 * Replaces a blob URL in a node with its corresponding S3 URL
 */
function replaceNodeBlobUrl(
  node: any,
  attributeToUpdate: 'src' | 'url',
  currentBlobUrl: string,
  fileUrlMap: { [key: string]: string },
  fileProcessingState: {
    files: Express.Multer.File[];
    currentIndex: number;
  },
): void {
  // Check if we have files left to process
  if (fileProcessingState.currentIndex < fileProcessingState.files.length) {
    const currentFile =
      fileProcessingState.files[fileProcessingState.currentIndex];

    // For attachments, check filename match
    if (
      node.type === 'attachment' &&
      node.attrs.fileName &&
      currentFile.originalname !== node.attrs.fileName
    ) {
      logger.warn(
        `Attachment filename mismatch: JSON fileName: '${node.attrs.fileName}', ` +
          `File originalname: '${currentFile.originalname}'`,
      );
    }

    // Replace the blob URL with S3 URL if available
    if (fileUrlMap[currentFile.originalname]) {
      node.attrs[attributeToUpdate] = fileUrlMap[currentFile.originalname];
      logger.log(
        `Replaced ${currentBlobUrl} with ${node.attrs[attributeToUpdate]} for ${currentFile.originalname}`,
      );
    } else {
      logger.warn(
        `${node.type}: S3 URL for ${currentFile.originalname} not found in fileUrlMap`,
      );
    }

    fileProcessingState.currentIndex++;
  } else {
    logger.warn(
      `${node.type}: Not enough files to replace blob URL: ${currentBlobUrl}. ` +
        `Processed ${fileProcessingState.currentIndex} files, but received ` +
        `${fileProcessingState.files.length} files.`,
    );
  }
}

/**
 * Process a document to replace all blob URLs with S3 URLs
 * @returns Number of unused files
 */
export function processDocumentContent(
  document: any,
  fileUrlMap: { [key: string]: string },
  files: Express.Multer.File[],
): number {
  const fileProcessingState = { files: files || [], currentIndex: 0 };

  if (document.content && Array.isArray(document.content)) {
    for (const rootContentNode of document.content) {
      processContentNode(rootContentNode, fileUrlMap, fileProcessingState);
    }
  }

  // Return number of unused files
  return fileProcessingState.files.length - fileProcessingState.currentIndex;
}
