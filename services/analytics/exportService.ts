// services/analytics/exportService.ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ApiResponse, ErrorCodes, FileUploadResponse } from '../../types/api';
import { Match, PlayerStats, LeaderboardEntry } from '../../types/models';
import { createErrorHandler } from '../../utils/errors';
import { formatDateTime } from '../../utils/format';

/**
 * Export Service
 *
 * Handles the logic for exporting data into different formats like CSV, PDF, or
 * a shareable image. It takes processed data and converts it into a file format.
 * This functionality is needed for the match history and analytics screens.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ExportFormat = 'csv' | 'pdf' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  fileName: string;
  data: Match[] | PlayerStats[] | LeaderboardEntry[];
}

export interface ExportResult {
  uri: string;
  mimeType: string;
}

export interface ExportServiceResponse<T = any> extends ApiResponse<T> {}

const handleError = createErrorHandler('ExportService', 'export_operations');

// ============================================
// SERVICE CLASS
// ============================================

export class ExportService {
  /**
   * Main function to export data to a file and share it.
   * @param options - The export options including format, fileName, and data.
   * @returns The result of the share action.
   */
  static async exportAndShare(
    options: ExportOptions
  ): Promise<ExportServiceResponse<null>> {
    try {
      const content = this.generateFileContent(options.data, options.format);
      if (!content) {
        throw new Error(`Unsupported format: ${options.format}`);
      }

      const fileUri = await this.saveToFile(
        content,
        options.fileName,
        options.format
      );

      if (!(await Sharing.isAvailableAsync())) {
        return {
          success: false,
          error: {
            code: ErrorCodes.SERVICE_UNAVAILABLE,
            message: 'Sharing is not available on this device.',
          },
          data: null,
          timestamp: new Date().toISOString(),
        };
      }

      await Sharing.shareAsync(fileUri);

      return {
        success: true,
        data: null,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'exportAndShare',
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

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Generates the string content for the file based on the format.
   * @param data - The data to be exported.
   * @param format - The export format.
   * @returns The file content as a string.
   */
  private static generateFileContent(
    data: any[],
    format: ExportFormat
  ): string {
    switch (format) {
      case 'csv':
        return this.convertToCSV(data);
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'pdf':
        // PDF generation is complex and would require a dedicated library
        // like react-native-html-to-pdf. This is a placeholder.
        console.warn('PDF export is not implemented yet.');
        return 'PDF export is not yet supported.';
      default:
        return '';
    }
  }

  /**
   * Converts an array of objects to a CSV string.
   * @param data - The array of objects.
   * @returns A string in CSV format.
   */
  private static convertToCSV(data: any[]): string {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const escaped = ('' + row[header]).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Saves the content to a local file.
   * @param content - The string content to save.
   * @param fileName - The base name for the file.
   * @param format - The file format.
   * @returns The URI of the saved file.
   */
  private static async saveToFile(
    content: string,
    fileName: string,
    format: ExportFormat
  ): Promise<string> {
    const fileExtension = {
      csv: '.csv',
      pdf: '.pdf',
      json: '.json',
    };

    const directory = FileSystem.documentDirectory;
    if (!directory) {
      throw new Error('Document directory not found.');
    }

    const fileUri = `${directory}${fileName}_${formatDateTime(
      new Date(),
      'YYYYMMDDHHmmss'
    )}${fileExtension[format]}`;

    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return fileUri;
  }
}

// ============================================
// EXPORTED INSTANCE
// ============================================

export const exportService = {
  exportAndShare: ExportService.exportAndShare,
};
