// app/match/create.tsx - FULL VERSION WITH SAFEGUARDS
import React, { useEffect, useCallback } from 'react';
import {
  Alert,
  BackHandler,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  MatchForm,
  MatchCreatedDisplay,
} from '../../components/forms/MatchForm';
import { useMatchCreation } from '../../hooks/match/useMatchCreation';
import { SimpleScreen } from '../../components/Layout/Screen/SimpleScreen';
import { useTheme } from '../../hooks/ui/useTheme';
import { SCREEN_TITLES, CONFIRMATION_MESSAGES } from '../../constants/messages';

export default function CreateMatchScreen() {
  const matchCreation = useMatchCreation();
  const { colors } = useTheme();

  console.log('CreateMatchScreen rendering, matchCreation state:', {
    isCreating: matchCreation?.isCreating,
    hasCreatedMatch: !!matchCreation?.createdMatch,
    hasErrors: !!matchCreation?.errors,
    errors: matchCreation?.errors,
  });

  // Safeguard against undefined matchCreation
  if (!matchCreation) {
    return (
      <SimpleScreen showHeader={false}>
        <View style={{ padding: 20 }}>
          <Text>Loading match creation...</Text>
        </View>
      </SimpleScreen>
    );
  }

  /**
   * Handle Android back button
   */
  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true;
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
    if (matchCreation.createdMatch) {
      router.back();
      return;
    }

    const hasUnsavedChanges =
      (matchCreation.formData?.title?.trim()?.length || 0) > 0 ||
      (matchCreation.formData?.description?.trim()?.length || 0) > 0 ||
      (matchCreation.formData?.location?.trim()?.length || 0) > 0;

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
            matchCreation.resetForm?.();
            router.back();
          },
        },
      ]);
    } else {
      router.back();
    }
  }, [
    matchCreation.createdMatch,
    matchCreation.formData,
    matchCreation.resetForm,
  ]);

  /**
   * Handle successful match creation - FIXED
   */
  const handleCreateMatch = useCallback(
    async (formData: any) => {
      try {
        console.log('Creating match with form data:', formData);

        // Update the hook's form data FIRST, then create
        if (matchCreation.updateFormData) {
          matchCreation.updateFormData(formData);
        }

        // Wait a tick for state to update before calling createMatch
        await new Promise((resolve) => setTimeout(resolve, 0));

        const result = await matchCreation.createMatch();

        if (result?.success && result?.data) {
          console.log('Match created successfully:', result.data.roomCode);
        } else {
          console.error('Match creation failed:', result?.error);
        }
      } catch (error) {
        console.error('Error in handleCreateMatch:', error);
      }
    },
    [matchCreation]
  );

  /**
   * Navigate to the created match
   */
  const handleGoToMatch = useCallback(() => {
    if (matchCreation.createdMatch?.id) {
      router.push(`/match/${matchCreation.createdMatch.id}` as any);
    }
  }, [matchCreation.createdMatch]);

  /**
   * Reset form to create another match
   */
  const handleCreateAnother = useCallback(() => {
    if (matchCreation.resetToNewMatch) {
      matchCreation.resetToNewMatch();
    }
  }, [matchCreation.resetToNewMatch]);

  /**
   * Handle sharing the match
   */
  const handleShareMatch = useCallback(async () => {
    try {
      if (matchCreation.shareMatch) {
        await matchCreation.shareMatch();
      }
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
              if (matchCreation.copyRoomCode) {
                const success = await matchCreation.copyRoomCode();
                if (success) {
                  Alert.alert('Copied!', 'Room code copied to clipboard');
                }
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
    if (matchCreation.copyRoomCode) {
      return await matchCreation.copyRoomCode();
    }
    return false;
  }, [matchCreation.copyRoomCode]);

  // Determine which view to show
  const showSuccessView = !!matchCreation.createdMatch;

  // Safeguard for SCREEN_TITLES
  const screenTitle = showSuccessView
    ? 'Match Created'
    : SCREEN_TITLES?.CREATE_MATCH || 'Create Match';

  console.log('Rendering view:', { showSuccessView, screenTitle });

  return (
    <SimpleScreen
      showHeader={false}
      style={{ backgroundColor: colors.background }}
    >
      <View style={[styles.customHeader, { borderBottomColor: colors.border }]}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {screenTitle}
        </Text>
        <View style={styles.backButton} />
      </View>
      {showSuccessView && matchCreation.createdMatch ? (
        <MatchCreatedDisplay
          match={matchCreation.createdMatch}
          roomCode={matchCreation.roomCode || ''}
          qrCodeData={matchCreation.qrCodeData || ''}
          onCopyRoomCode={handleCopyRoomCode}
          onShareMatch={handleShareMatch}
          onCreateAnother={handleCreateAnother}
          onGoToMatch={handleGoToMatch}
        />
      ) : (
        <MatchForm
          onSubmit={handleCreateMatch}
          loading={matchCreation.isCreating || false}
          serverError={
            matchCreation.errors?.general
              ? String(matchCreation.errors.general)
              : undefined
          }
        />
      )}
    </SimpleScreen>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
