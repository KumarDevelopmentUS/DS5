// app/match/create.tsx
import React, { useEffect, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { router } from 'expo-router';
import {
  MatchForm,
  MatchCreatedDisplay,
} from '../../components/forms/MatchForm';
import { useMatchCreation } from '../../hooks/match/useMatchCreation';
import { ScreenHeader } from '../../components/Layout/Screen/ScreenHeader';
import { SCREEN_TITLES, CONFIRMATION_MESSAGES } from '../../constants/messages';

/**
 * Match Creation Screen
 *
 * A dedicated screen for creating new matches. Uses a single-screen approach
 * for optimal user experience. After successful creation, displays the match
 * details with QR code and sharing options.
 *
 * Flow:
 * 1. User fills out match creation form
 * 2. Form validates and creates match
 * 3. Success screen shows with QR code and sharing
 * 4. User can go to match or create another
 */
export default function CreateMatchScreen() {
  const matchCreation = useMatchCreation();

  /**
   * Handle Android back button
   */
  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [matchCreation.formData, matchCreation.createdMatch]);

  /**
   * Handle back navigation with unsaved changes warning
   */
  const handleBackPress = useCallback(() => {
    // If match was created, navigate back without warning
    if (matchCreation.createdMatch) {
      router.back();
      return;
    }

    // Check if form has unsaved changes
    const hasUnsavedChanges =
      matchCreation.formData.title.trim().length > 0 ||
      matchCreation.formData.description.trim().length > 0 ||
      matchCreation.formData.location.trim().length > 0;

    if (hasUnsavedChanges) {
      Alert.alert('Discard Changes?', CONFIRMATION_MESSAGES.DISCARD_CHANGES, [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            matchCreation.resetForm();
            router.back();
          },
        },
      ]);
    } else {
      router.back();
    }
  }, [
    matchCreation.createdMatch,
    matchCreation.formData.title,
    matchCreation.formData.description,
    matchCreation.formData.location,
    matchCreation.resetForm,
  ]);

  /**
   * Handle successful match creation
   */
  const handleCreateMatch = useCallback(async () => {
    const result = await matchCreation.createMatch();

    if (result.success && result.data) {
      // Match created successfully - the UI will automatically switch to success view
      // You could add analytics tracking here
      console.log('Match created successfully:', result.data.roomCode);
    }
    // Errors are handled by the hook and displayed in the form
  }, [matchCreation.createMatch]);

  /**
   * Handle form field updates
   */
  const handleUpdateField = useCallback(
    (field: any, value: any) => {
      matchCreation.updateField(field, value);
    },
    [matchCreation.updateField]
  );

  /**
   * Handle form data updates
   */
  const handleUpdateFormData = useCallback(
    (updates: any) => {
      matchCreation.updateFormData(updates);
    },
    [matchCreation.updateFormData]
  );

  /**
   * Handle clearing field errors
   */
  const handleClearError = useCallback(
    (field: any) => {
      matchCreation.clearFieldError(field);
    },
    [matchCreation.clearFieldError]
  );

  /**
   * Navigate to the created match
   */
  const handleGoToMatch = useCallback(() => {
    if (matchCreation.createdMatch) {
      router.push(`/match/${matchCreation.createdMatch.id}` as any);
    }
  }, [matchCreation.createdMatch]);

  /**
   * Reset form to create another match
   */
  const handleCreateAnother = useCallback(() => {
    matchCreation.resetToNewMatch();
  }, [matchCreation.resetToNewMatch]);

  /**
   * Handle sharing the match
   */
  const handleShareMatch = useCallback(async () => {
    try {
      await matchCreation.shareMatch();
    } catch (error) {
      Alert.alert(
        'Share Failed',
        'Unable to share the match. You can copy the room code instead.',
        [
          {
            text: 'OK',
          },
          {
            text: 'Copy Room Code',
            onPress: async () => {
              const success = await matchCreation.copyRoomCode();
              if (success) {
                Alert.alert('Copied!', 'Room code copied to clipboard');
              }
            },
          },
        ]
      );
    }
  }, [matchCreation.shareMatch, matchCreation.copyRoomCode]);

  /**
   * Handle copying room code
   */
  const handleCopyRoomCode = useCallback(async (): Promise<boolean> => {
    const success = await matchCreation.copyRoomCode();
    return success;
  }, [matchCreation.copyRoomCode]);

  // Determine which view to show
  const showSuccessView = !!matchCreation.createdMatch;

  return (
    <>
      {/* Header */}
      <ScreenHeader
        title={showSuccessView ? 'Match Created' : SCREEN_TITLES.CREATE_MATCH}
        onBackPress={handleBackPress}
        showBackButton={true}
      />

      {/* Main Content */}
      {showSuccessView ? (
        <MatchCreatedDisplay
          match={matchCreation.createdMatch!}
          roomCode={matchCreation.roomCode!}
          qrCodeData={matchCreation.qrCodeData!}
          onCopyRoomCode={handleCopyRoomCode}
          onShareMatch={handleShareMatch}
          onCreateAnother={handleCreateAnother}
          onGoToMatch={handleGoToMatch}
        />
      ) : (
        <MatchForm
          formData={matchCreation.formData}
          errors={matchCreation.errors}
          isCreating={matchCreation.isCreating}
          isFormValid={matchCreation.isFormValid}
          onUpdateField={handleUpdateField}
          onUpdateFormData={handleUpdateFormData}
          onCreateMatch={handleCreateMatch}
          onClearError={handleClearError}
        />
      )}
    </>
  );
}
