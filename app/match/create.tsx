// app/match/create.tsx - DIRECT NAVIGATION VERSION
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
import { MatchForm } from '../../components/forms/MatchForm';
import { useMatchCreation } from '../../hooks/match/useMatchCreation';
import { SimpleScreen } from '../../components/Layout/Screen/SimpleScreen';
import { useTheme } from '../../contexts/ThemeContext';
import { SCREEN_TITLES, CONFIRMATION_MESSAGES } from '../../constants/messages';
import type { MatchFormData } from '../../components/forms/MatchForm/MatchForm.types';

export default function CreateMatchScreen() {
  const matchCreation = useMatchCreation();
  const { colors } = useTheme();

  console.log('CreateMatchScreen rendering, matchCreation state:', {
    isCreating: matchCreation?.isCreating,
    hasCreatedMatch: !!matchCreation?.createdMatch,
    hasErrors: !!matchCreation?.errors,
    errors: matchCreation?.errors,
    matchId: matchCreation?.createdMatch?.id,
    roomCode: matchCreation?.roomCode,
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

  // Auto-navigate to match when created
  useEffect(() => {
    if (matchCreation.createdMatch?.id) {
      console.log(
        'Match created, auto-navigating to match:',
        matchCreation.createdMatch.id
      );

      // Small delay to ensure state is updated
      const timer = setTimeout(() => {
        const matchId = matchCreation.createdMatch!.id;
        console.log('Navigating to match:', matchId);

        // Clear the form state
        if (matchCreation.resetForm) {
          matchCreation.resetForm();
        }

        // Navigate directly to the match
        router.replace(`/match/${matchId}` as any);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [matchCreation.createdMatch?.id, matchCreation.resetForm]);

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
  }, [matchCreation.formData]);

  /**
   * Handle back navigation with unsaved changes warning
   */
  const handleBackPress = useCallback(() => {
    const hasUnsavedChanges =
      (matchCreation.formData as MatchFormData)?.title?.trim()?.length > 0 ||
      (matchCreation.formData as MatchFormData)?.location?.trim()?.length > 0 ||
      (matchCreation.formData as MatchFormData)?.team1Name?.trim()?.length > 0 ||
      (matchCreation.formData as MatchFormData)?.team2Name?.trim()?.length > 0 ||
      (matchCreation.formData as MatchFormData)?.player1Name?.trim()?.length > 0 ||
      (matchCreation.formData as MatchFormData)?.player2Name?.trim()?.length > 0 ||
      (matchCreation.formData as MatchFormData)?.player3Name?.trim()?.length > 0 ||
      (matchCreation.formData as MatchFormData)?.player4Name?.trim()?.length > 0;

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
  }, [matchCreation.formData, matchCreation.resetForm]);

  /**
   * Handle successful match creation
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
          console.log('Match created successfully:', {
            id: result.data.id,
            roomCode: result.data.roomCode,
            title: result.data.title,
          });
          // Navigation will happen automatically via useEffect
        } else {
          console.error('Match creation failed:', result?.error);
          Alert.alert(
            'Match Creation Failed',
            result?.error?.message ||
              'Unable to create match. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error in handleCreateMatch:', error);
        Alert.alert(
          'Error',
          'An unexpected error occurred. Please try again.',
          [{ text: 'OK' }]
        );
      }
    },
    [matchCreation]
  );

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
          {SCREEN_TITLES?.CREATE_MATCH || 'Create Match'}
        </Text>
        <View style={styles.backButton} />
      </View>

      <MatchForm
        onSubmit={handleCreateMatch}
        loading={matchCreation.isCreating || false}
        serverError={
          matchCreation.errors?.general
            ? String(matchCreation.errors.general)
            : undefined
        }
      />
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
