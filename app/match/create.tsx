// app/match/create.tsx
import React, { useEffect, useCallback } from 'react';
import { Alert, BackHandler, View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MatchForm } from '../../components/forms/MatchForm';
import { SimpleScreen } from '../../components/Layout/Screen/SimpleScreen';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/auth/useAuth';
import { EnhancedMatchService } from '../../services/match/enhancedMatchService';
import { SCREEN_TITLES, CONFIRMATION_MESSAGES } from '../../constants/messages';
import { TrackerMatchFormData } from '../../types/tracker';
import { createDefaultMatchSettings } from '../../utils/playerDefaults';

/**
 * Create Match Screen
 * 
 * Handles match creation with form validation and navigation to tracker.
 */
export default function CreateMatchScreen() {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [isCreating, setIsCreating] = React.useState(false);
  const [formData, setFormData] = React.useState<TrackerMatchFormData | null>(
    null
  );
  const [error, setError] = React.useState<string | null>(null);

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
  }, [formData]);

  /**
   * Handle back navigation with unsaved changes warning
   */
  const handleBackPress = useCallback(() => {
    const hasUnsavedChanges =
      (formData?.title?.trim() || '').length > 0 ||
      (formData?.location?.trim() || '').length > 0 ||
      (formData?.team1Name?.trim() || '').length > 0 ||
      (formData?.team2Name?.trim() || '').length > 0 ||
      (formData?.player1Name?.trim() || '').length > 0 ||
      (formData?.player2Name?.trim() || '').length > 0 ||
      (formData?.player3Name?.trim() || '').length > 0 ||
      (formData?.player4Name?.trim() || '').length > 0;

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
            setFormData(null);
            router.back();
          },
        },
      ]);
    } else {
      router.back();
    }
  }, [formData]);

  /**
   * Handle successful match creation
   */
  const handleCreateMatch = useCallback(
    async (data: TrackerMatchFormData) => {
      if (!isAuthenticated || !user) {
        setError('You must be logged in to create a match');
        return;
      }

      setIsCreating(true);
      setError(null);
      setFormData(data);

      try {
        console.log('Starting match creation for user:', user.id);
        
        // Prepare enhanced match data for the service
        const createMatchData = {
          title: data.title.trim(),
          description: data.description?.trim() || undefined,
          gameType: 'die_stats',
          location: data.location?.trim() || undefined,
          scoreLimit: data.scoreLimit,
          winByTwo: data.winByTwo,
          sinkPoints: data.sinkPoints,
          isPublic: data.isPublic,
          // Enhanced settings with team and player names
          settings: createDefaultMatchSettings({
            scoreLimit: data.scoreLimit,
            winByTwo: data.winByTwo,
            sinkPoints: data.sinkPoints,
            teamNames: {
              team1: data.team1Name.trim(),
              team2: data.team2Name.trim(),
            },
            playerNames: {
              player1: data.player1Name.trim(),
              player2: data.player2Name.trim(),
              player3: data.player3Name.trim(),
              player4: data.player4Name.trim(),
            },
          }),
        };

        console.log('Calling EnhancedMatchService.createMatch with data:', createMatchData);

        const result = await EnhancedMatchService.createMatch(
          createMatchData,
          user.id
        );

        console.log('Match creation result:', result);

        if (result.success && result.data) {
          console.log('Match created successfully, navigating to:', result.data.id);
          console.log('Full match data:', result.data);
          // Navigate to the new tracker interface
          router.replace(`/match/${result.data.id}` as any);
        } else {
          console.error('Match creation failed:', result.error);
          setError(
            result.error?.message || 'Failed to create match. Please try again.'
          );
        }
      } catch (error) {
        console.error('Unexpected error in match creation:', error);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsCreating(false);
      }
    },
    [isAuthenticated, user]
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
        loading={isCreating}
        serverError={error}
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
