// services/storage/mediaService.ts
import * as FileSystem from 'expo-file-system';
import { supabase } from '../database/databaseService';
import {
  ApiResponse,
  ErrorCodes,
  FileUploadResponse,
  UploadProgress,
} from '../../types/api';
import { createErrorHandler } from '../../utils/errors';
import { validateFileUpload } from '../../utils/validation';

/**
 * Media Service
 *
 * Manages all file uploads to Supabase Storage, including user avatars,
 * community banners, and photos attached to posts. It also handles
 * image compression and thumbnail generation (though compression is a placeholder here).
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type StorageBucket = 'avatars' | 'banners' | 'posts';

export interface UploadOptions {
  bucket: StorageBucket;
  fileUri: string;
  userId: string;
  onProgress?: (progress: UploadProgress) => void;
}

export interface MediaServiceResponse<T = any> extends ApiResponse<T> {}

const handleError = createErrorHandler('MediaService', 'upload_operations');

// ============================================
// SERVICE CLASS
// ============================================

export class MediaService {
  /**
   * Uploads a media file to the specified Supabase Storage bucket.
   * @param options - The options for the upload.
   * @returns A response containing the public URL of the uploaded file.
   */
  static async uploadMedia(
    options: UploadOptions
  ): Promise<MediaServiceResponse<FileUploadResponse>> {
    const { bucket, fileUri, userId } = options;

    try {
      // 1. Get file info and determine content type
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists || fileInfo.size === undefined) {
        throw new Error('File does not exist or size is unreadable.');
      }
      const fileExtension = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = `image/${fileExtension}`;

      // 2. Validate the file before uploading
      // FIX: The second argument must be a string literal indicating the file category.
      const fileType = bucket === 'avatars' ? 'avatar' : 'image';

      const validation = validateFileUpload(
        { size: fileInfo.size, type: contentType },
        fileType
      );

      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_FAILED,
            message: validation.error || 'File validation failed.',
          },
          data: null,
          timestamp: new Date().toISOString(),
        };
      }

      // 3. Prepare file for upload
      const fileName = `${userId}-${Date.now()}.${fileExtension}`;
      const filePath = `${userId}/${fileName}`;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 4. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileContent, {
          contentType,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 5. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

      const response: FileUploadResponse = {
        url: publicUrlData.publicUrl,
        publicUrl: publicUrlData.publicUrl,
        path: uploadData.path,
        size: fileInfo.size,
        mimeType: contentType,
      };

      return {
        success: true,
        data: response,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'uploadMedia',
        ...options,
      });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// ============================================
// EXPORTED INSTANCE
// ============================================

export const mediaService = {
  uploadMedia: MediaService.uploadMedia,
};
