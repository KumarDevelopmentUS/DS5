// hooks/match/useMatchCreation.ts
import { useState, useCallback } from 'react';
import { MatchStatus } from '../../types/enums';
import type { MatchConfig, MatchFormData, Match } from '../../types/models';
import type { ApiResponse } from '../../types/api';
import { MATCH_SETTINGS } from '../../constants/game';
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from '../../constants/messages';
import { validateMatchTitle, sanitizeInput } from '../../utils/validation';
import { createErrorHandler } from '../../utils/errors';
import {
  matchService,
  type CreateMatchData,
} from '../../services/match/matchService';
import { useAuthContext } from '../../contexts/AuthContext';

/**
 * Single-Screen Match Creation Hook
 *
 * Manages the state and logic for creating a match on a single screen.
 * After successful creation, displays the match details including QR code
 * for other players to join.
 *
 * Features:
 * - Single form with all match settings
 * - Real-time validation
 * - Match creation and QR code display
 * - Error handling and user feedback
 */

// Form data interface for match creation
export interface MatchCreationFormData {
  // Basic Info
  title: string;
  description: string;
  location: string;

  // Game Settings
  scoreLimit: number;
  winByTwo: boolean;
  sinkPoints: 3 | 5;

  // Visibility
  isPublic: boolean;

  // TODO: Future features
  // teamAssignment: 'random' | 'manual';
  // inviteList: string[];
}

// Validation errors for each field
export interface MatchCreationErrors {
  title?: string;
  description?: string;
  location?: string;
  scoreLimit?: string;
  sinkPoints?: string;
  general?: string;
}

// Hook state interface
export interface MatchCreationState {
  // Form data
  formData: MatchCreationFormData;

  // Validation
  errors: MatchCreationErrors;
  isFormValid: boolean;

  // Creation state
  isCreating: boolean;
  createdMatch: Match | null;

  // QR Code and sharing
  roomCode: string | null;
  shareableUrl: string | null;
  qrCodeData: string | null;
}

// Hook actions interface
export interface MatchCreationActions {
  // Form data updates
  updateFormData: (updates: Partial<MatchCreationFormData>) => void;
  updateField: <K extends keyof MatchCreationFormData>(
    field: K,
    value: MatchCreationFormData[K]
  ) => void;

  // Validation
  validateField: <K extends keyof MatchCreationFormData>(
    field: K,
    value: MatchCreationFormData[K]
  ) => string | undefined;
  validateForm: () => boolean;
  clearErrors: () => void;
  clearFieldError: (field: keyof MatchCreationErrors) => void;

  // Match creation
  createMatch: () => Promise<ApiResponse<Match>>;

  // Form management
  resetForm: () => void;
  resetToNewMatch: () => void;

  // Sharing utilities
  copyRoomCode: () => Promise<boolean>;
  copyShareableUrl: () => Promise<boolean>;
  shareMatch: () => Promise<void>;
}

// Combined hook return type
export interface UseMatchCreationReturn
  extends MatchCreationState,
    MatchCreationActions {}

// Default form data with game defaults
const getDefaultFormData = (): MatchCreationFormData => ({
  // Basic Info
  title: '',
  description: '',
  location: '',

  // Game Settings (using constants from game.ts)
  scoreLimit: MATCH_SETTINGS.DEFAULT_SCORE_LIMIT, // 11
  winByTwo: MATCH_SETTINGS.DEFAULT_WIN_BY_TWO, // true
  sinkPoints: MATCH_SETTINGS.DEFAULT_SINK_POINTS as 3 | 5, // 3

  // Visibility
  isPublic: MATCH_SETTINGS.DEFAULT_VISIBILITY === 'public', // true
});

// Error handler for this hook
const handleError = createErrorHandler('useMatchCreation', 'match_creation');

/**
 * Custom hook for managing single-screen match creation
 */
export const useMatchCreation = (): UseMatchCreationReturn => {
  // Get current user from auth context
  const { user, isAuthenticated } = useAuthContext();

  // Form state
  const [formData, setFormData] =
    useState<MatchCreationFormData>(getDefaultFormData());
  const [errors, setErrors] = useState<MatchCreationErrors>({});

  // Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [createdMatch, setCreatedMatch] = useState<Match | null>(null);

  // QR Code and sharing state
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  // Derived state
  const isFormValid =
    Object.keys(errors).length === 0 && formData.title.trim().length > 0;

  /**
   * Updates multiple form fields at once
   */
  const updateFormData = useCallback(
    (updates: Partial<MatchCreationFormData>) => {
      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      // Clear errors for updated fields
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(updates).forEach((key) => {
          delete newErrors[key as keyof MatchCreationErrors];
        });
        return newErrors;
      });
    },
    []
  );

  /**
   * Updates a single form field
   */
  const updateField = useCallback(
    <K extends keyof MatchCreationFormData>(
      field: K,
      value: MatchCreationFormData[K]
    ) => {
      updateFormData({ [field]: value });
    },
    [updateFormData]
  );

  /**
   * Validates a single field and returns error message if invalid
   */
  const validateField = useCallback(
    <K extends keyof MatchCreationFormData>(
      field: K,
      value: MatchCreationFormData[K]
    ): string | undefined => {
      switch (field) {
        case 'title': {
          const titleValidation = validateMatchTitle(value as string);
          return titleValidation.isValid ? undefined : titleValidation.error;
        }

        case 'description': {
          const desc = value as string;
          if (desc && desc.length > 500) {
            return VALIDATION_MESSAGES.DESCRIPTION_TOO_LONG;
          }
          return undefined;
        }

        case 'location': {
          const loc = value as string;
          if (loc && loc.length > 100) {
            return VALIDATION_MESSAGES.LOCATION_TOO_LONG;
          }
          return undefined;
        }

        case 'scoreLimit': {
          const limit = value as number;
          if (!MATCH_SETTINGS.SCORE_LIMIT_OPTIONS.includes(limit as any)) {
            return `Score limit must be one of: ${MATCH_SETTINGS.SCORE_LIMIT_OPTIONS.join(', ')}`;
          }
          return undefined;
        }

        case 'sinkPoints': {
          const points = value as number;
          if (!MATCH_SETTINGS.SINK_POINTS_OPTIONS.includes(points as any)) {
            return `Sink points must be ${MATCH_SETTINGS.SINK_POINTS_OPTIONS.join(' or ')}`;
          }
          return undefined;
        }

        default:
          return undefined;
      }
    },
    []
  );

  /**
   * Validates the entire form and sets errors
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: MatchCreationErrors = {};

    // Title is required
    if (!formData.title.trim()) {
      newErrors.title = VALIDATION_MESSAGES.TITLE_REQUIRED;
    } else {
      const titleError = validateField('title', formData.title);
      if (titleError) {
        newErrors.title = titleError;
      }
    }

    // Validate description if provided
    if (formData.description) {
      const descError = validateField('description', formData.description);
      if (descError) {
        newErrors.description = descError;
      }
    }

    // Validate location if provided
    if (formData.location) {
      const locError = validateField('location', formData.location);
      if (locError) {
        newErrors.location = locError;
      }
    }

    // Validate score limit
    const scoreLimitError = validateField('scoreLimit', formData.scoreLimit);
    if (scoreLimitError) {
      newErrors.scoreLimit = scoreLimitError;
    }

    // Validate sink points
    const sinkPointsError = validateField('sinkPoints', formData.sinkPoints);
    if (sinkPointsError) {
      newErrors.sinkPoints = sinkPointsError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  /**
   * Clears all validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Clears error for a specific field
   */
  const clearFieldError = useCallback((field: keyof MatchCreationErrors) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Generates QR code data and shareable URL for the match
   */
  const generateSharingData = useCallback((match: Match) => {
    const roomCode = match.roomCode;

    // Generate shareable URL (this would be your app's deep link)
    // Format: diestats://join/A-123456 or https://diestats.app/join/A-123456
    const baseUrl = 'diestats://join/'; // or your universal link domain
    const shareableUrl = `${baseUrl}${roomCode}`;

    // QR code data - this will be the same URL that gets encoded into QR
    const qrCodeData = shareableUrl;

    setRoomCode(roomCode);
    setShareableUrl(shareableUrl);
    setQrCodeData(qrCodeData);
  }, []);

  /**
   * Creates the match using the current form data
   */
  const createMatch = useCallback(async (): Promise<ApiResponse<Match>> => {
    if (!isAuthenticated || !user) {
      const error = ERROR_MESSAGES.UNAUTHORIZED;
      setErrors({ general: error });
      return {
        data: null,
        error: { code: 'AUTH_REQUIRED', message: error },
        success: false,
        timestamp: new Date().toISOString(),
      };
    }

    // Validate form before creating
    if (!validateForm()) {
      const error =
        'Please fix all validation errors before creating the match';
      setErrors((prev) => ({ ...prev, general: error }));
      return {
        data: null,
        error: { code: 'VALIDATION_FAILED', message: error },
        success: false,
        timestamp: new Date().toISOString(),
      };
    }

    setIsCreating(true);
    setErrors({});

    try {
      // Prepare match data for the service
      const createMatchData: CreateMatchData = {
        title: sanitizeInput(formData.title.trim()),
        description: formData.description.trim() || undefined,
        gameType: 'die_stats', // Always die game as specified
        location: formData.location.trim() || undefined,
        scoreLimit: formData.scoreLimit,
        winByTwo: formData.winByTwo,
        sinkPoints: formData.sinkPoints,
        isPublic: formData.isPublic,
        // TODO: Add team assignment when implemented
        // teamAssignment: formData.teamAssignment,
      };

      // Create the match
      const result = await matchService.createMatch(createMatchData, user.id);

      if (result.success && result.data) {
        // Set created match and generate sharing data
        setCreatedMatch(result.data);
        generateSharingData(result.data);
      } else {
        // Set general error if creation failed
        setErrors({
          general: result.error?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
        });
      }

      return result;
    } catch (error: any) {
      const parsedError = handleError(error, {
        action: 'createMatch',
        formData,
      });

      setErrors({
        general: parsedError.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      });

      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    } finally {
      setIsCreating(false);
    }
  }, [isAuthenticated, user, formData, validateForm, generateSharingData]);

  /**
   * Resets the entire form and creation state
   */
  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData());
    setErrors({});
    setIsCreating(false);
    setCreatedMatch(null);
    setRoomCode(null);
    setShareableUrl(null);
    setQrCodeData(null);
  }, []);

  /**
   * Resets to create a new match (keeps created match visible but allows new creation)
   */
  const resetToNewMatch = useCallback(() => {
    setFormData(getDefaultFormData());
    setErrors({});
    setIsCreating(false);
    // Keep createdMatch, roomCode, etc. for reference
  }, []);

  /**
   * Copies room code to clipboard
   */
  const copyRoomCode = useCallback(async (): Promise<boolean> => {
    if (!roomCode) return false;

    try {
      // Use Expo Clipboard API or fallback
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(roomCode);
        return true;
      }

      // TODO: Use Expo Clipboard when in React Native environment
      // import * as Clipboard from 'expo-clipboard';
      // await Clipboard.setStringAsync(roomCode);

      console.log('Room code copied:', roomCode);
      return true;
    } catch (error) {
      console.error('Failed to copy room code:', error);
      return false;
    }
  }, [roomCode]);

  /**
   * Copies shareable URL to clipboard
   */
  const copyShareableUrl = useCallback(async (): Promise<boolean> => {
    if (!shareableUrl) return false;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareableUrl);
        return true;
      }

      // TODO: Use Expo Clipboard when in React Native environment
      console.log('Shareable URL copied:', shareableUrl);
      return true;
    } catch (error) {
      console.error('Failed to copy shareable URL:', error);
      return false;
    }
  }, [shareableUrl]);

  /**
   * Opens native share dialog
   */
  const shareMatch = useCallback(async (): Promise<void> => {
    if (!shareableUrl || !createdMatch) return;

    try {
      const shareData = {
        title: `Join my Die Stats match: ${createdMatch.title}`,
        text: `Join my match "${createdMatch.title}" using room code: ${roomCode}`,
        url: shareableUrl,
      };

      // TODO: Use Expo Sharing when in React Native environment
      // import * as Sharing from 'expo-sharing';
      // await Sharing.shareAsync(shareableUrl, {
      //   dialogTitle: 'Share Match',
      // });

      // Web fallback
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying URL
        await copyShareableUrl();
      }
    } catch (error) {
      console.error('Failed to share match:', error);
    }
  }, [shareableUrl, createdMatch, roomCode, copyShareableUrl]);

  return {
    // State
    formData,
    errors,
    isFormValid,
    isCreating,
    createdMatch,
    roomCode,
    shareableUrl,
    qrCodeData,

    // Actions
    updateFormData,
    updateField,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    createMatch,
    resetForm,
    resetToNewMatch,
    copyRoomCode,
    copyShareableUrl,
    shareMatch,
  };
};

// Export hook as default
export default useMatchCreation;
