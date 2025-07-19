// app/match/join/code/[code].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../../components/core/Button';
import { Card } from '../../../../components/core/Card';
import { Avatar } from '../../../../components/core/Avatar';
import { useAuth } from '../../../../hooks/auth/useAuth';
import { useTheme } from '../../../../hooks/ui/useTheme';
import { EnhancedMatchService } from '../../../../services/match/enhancedMatchService';
import { SPACING, TYPOGRAPHY, BORDERS } from '../../../../constants/theme';

type JoinMatchByCodeParams = {
  code: string;
  player?: string;
  user?: string;
}

/**
 * Join Match by Code Screen
 * 
 * Allows users to join an existing match using just the 6-character room code.
 * Provides a cleaner URL structure for sharing matches.
 */
export default function JoinMatchByCodeScreen() {
  const { code, player, user: userNameFromLink } = useLocalSearchParams<JoinMatchByCodeParams>();
  const router = useRouter();
  const { colors } = useTheme();
  const { user, profile, signIn } = useAuth();
  
  const [match, setMatch] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  // Load match data by room code
  useEffect(() => {
    if (code) {
      loadMatchDataByCode();
    }
  }, [code]);

  // Handle player parameter from deep link
  useEffect(() => {
    if (player && match) {
      // Auto-proceed to player selection if player is specified
      setScanned(true);
      
      // Map player parameter to actual player ID
      const playerMap: Record<string, string> = {
        'player1': 'default_1',
        'player2': 'default_2', 
        'player3': 'default_3',
        'player4': 'default_4',
      };
      
      const targetPlayerId = playerMap[player];
      if (targetPlayerId) {
        // Check if this player slot is available
        const availablePlayer = players.find(p => p.id === targetPlayerId && !p.userId);
        if (availablePlayer) {
          setSelectedPlayerId(targetPlayerId);
          console.log(`Auto-selected player from deep link: ${player} -> ${targetPlayerId}`);
          // Auto-proceed to join section if player is specified
          setScanned(true);
        } else {
          console.log(`Player slot ${player} is not available`);
        }
      }
    }
  }, [player, match, players]);

  const loadMatchDataByCode = async () => {
    try {
      setLoading(true);
      const result = await EnhancedMatchService.getMatchByRoomCode(code);
      
      if (result.success && result.data) {
        setMatch(result.data);
        
        // Create 4 default player slots - always show all 4 slots
        const defaultPlayerSlots = [
          { id: 'default_1', name: 'Player 1', team: 'team1', userId: null, avatarUrl: null, isDefault: true },
          { id: 'default_2', name: 'Player 2', team: 'team1', userId: null, avatarUrl: null, isDefault: true },
          { id: 'default_3', name: 'Player 3', team: 'team2', userId: null, avatarUrl: null, isDefault: true },
          { id: 'default_4', name: 'Player 4', team: 'team2', userId: null, avatarUrl: null, isDefault: true },
        ];
        
        // If there are participants, update the slots
        if (result.data?.participants && result.data.participants.length > 0) {
          const updatedSlots = defaultPlayerSlots.map((slot, index) => {
            // Find participant for this position
            const participant = result.data!.participants?.find((p: any) => {
              if (p.team === 'team1' && index < 2) return true;
              if (p.team === 'team2' && index >= 2) return true;
              return false;
            });
            
            if (participant) {
              return {
                ...slot,
                name: participant.username || slot.name,
                userId: participant.userId,
                avatarUrl: participant.avatarUrl,
                isDefault: false,
              };
            }
            
            return slot;
          });
          
          setPlayers(updatedSlots);
        } else {
          // No participants yet, use default slots
          setPlayers(defaultPlayerSlots);
        }
      } else {
        Alert.alert('Error', 'Match not found or invalid room code');
        router.back();
      }
    } catch (error) {
      console.error('Error loading match:', error);
      Alert.alert('Error', 'Failed to load match data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOption = () => {
    setScanned(true);
    // Proceed to player selection
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  const handleBackToSelection = () => {
    setSelectedPlayerId(null);
  };

  const handleJoinMatch = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'You need to sign in to join this match');
      return;
    }

    try {
      setJoining(true);
      
      // Use the user name from deep link if available, otherwise use profile/email
      const displayName = userNameFromLink || profile?.username || user.email || 'Unknown Player';
      
      // Simple join - just send user info to host's tracker
      const result = await EnhancedMatchService.joinMatchSimple(
        match.id,
        user.id,
        displayName,
        profile?.avatarUrl,
        selectedPlayerId || undefined // Pass the selected player ID
      );

      if (result.success) {
        Alert.alert(
          'Success!',
          `You have joined the match as ${displayName}! The host will see you in their tracker.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to home or close the join page
                router.back();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error?.message || 'Failed to join match');
      }
    } catch (error) {
      console.error('Error joining match:', error);
      Alert.alert('Error', 'Failed to join match');
    } finally {
      setJoining(false);
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn({ email: '', password: '' });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };



  // Render join options (QR code scan, manual entry)
  const renderJoinOptions = () => (
    <View style={styles.container}>
      <Card variant="default" style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="qr-code" size={48} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            Join Match
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Room Code: {code}
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            You're about to join a match. Select your player position to continue.
          </Text>
          
          <Button
            variant="primary"
            size="large"
            onPress={handleJoinOption}
            style={styles.joinButton}
            testID="join-match-button"
          >
            Continue to Join
          </Button>
        </View>
      </Card>
    </View>
  );

  // Render player selection
  const renderPlayerSelection = () => (
    <View style={styles.container}>
      <Card variant="default" style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="people" size={48} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            Select Your Position
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose which player slot to join
          </Text>
        </View>

        <View style={styles.content}>
          {/* Team 1 */}
          <View style={styles.teamSection}>
            <Text style={[styles.teamTitle, { color: colors.text }]}>
              {match?.settings?.teamNames?.team1 || 'Team 1'}
            </Text>
            <View style={styles.playerGrid}>
              {players.slice(0, 2).map((player, index) => (
                <Card
                  key={player.id}
                  variant={selectedPlayerId === player.id ? "elevated" : "outlined"}
                  pressable
                  onPress={() => handlePlayerSelect(player.id)}
                  style={[
                    styles.playerCard,
                    selectedPlayerId === player.id ? { borderColor: colors.primary } : {}
                  ]}
                >
                  <Avatar
                    source={player.avatarUrl}
                    name={player.name}
                    size="large"
                    style={styles.playerAvatar}
                  />
                  <Text style={[styles.playerName, { color: colors.text }]}>
                    {player.name}
                  </Text>
                  {player.userId ? (
                    <Text style={[styles.playerStatus, { color: colors.textSecondary }]}>
                      Occupied
                    </Text>
                  ) : (
                    <Text style={[styles.playerStatus, { color: colors.success }]}>
                      Available
                    </Text>
                  )}
                </Card>
              ))}
            </View>
          </View>

          {/* Team 2 */}
          <View style={styles.teamSection}>
            <Text style={[styles.teamTitle, { color: colors.text }]}>
              {match?.settings?.teamNames?.team2 || 'Team 2'}
            </Text>
            <View style={styles.playerGrid}>
              {players.slice(2, 4).map((player, index) => (
                <Card
                  key={player.id}
                  variant={selectedPlayerId === player.id ? "elevated" : "outlined"}
                  pressable
                  onPress={() => handlePlayerSelect(player.id)}
                  style={[
                    styles.playerCard,
                    selectedPlayerId === player.id ? { borderColor: colors.primary } : {}
                  ]}
                >
                  <Avatar
                    source={player.avatarUrl}
                    name={player.name}
                    size="large"
                    style={styles.playerAvatar}
                  />
                  <Text style={[styles.playerName, { color: colors.text }]}>
                    {player.name}
                  </Text>
                  {player.userId ? (
                    <Text style={[styles.playerStatus, { color: colors.textSecondary }]}>
                      Occupied
                    </Text>
                  ) : (
                    <Text style={[styles.playerStatus, { color: colors.success }]}>
                      Available
                    </Text>
                  )}
                </Card>
              ))}
            </View>
          </View>

          <Button
            variant="outline"
            size="medium"
            onPress={handleBackToSelection}
            style={styles.backButton}
            testID="back-to-selection-button"
          >
            Back
          </Button>
        </View>
      </Card>
    </View>
  );

  // Render join confirmation
  const renderJoinConfirmation = () => (
    <View style={styles.container}>
      <Card variant="default" style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          <Text style={[styles.title, { color: colors.text }]}>
            Ready to Join
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Confirm your selection
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.confirmationSection}>
            <Text style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
              Match:
            </Text>
            <Text style={[styles.confirmationValue, { color: colors.text }]}>
              {match?.title}
            </Text>
          </View>

          <View style={styles.confirmationSection}>
            <Text style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
              Your Position:
            </Text>
            <Text style={[styles.confirmationValue, { color: colors.text }]}>
              {players.find(p => p.id === selectedPlayerId)?.name}
            </Text>
          </View>

          <View style={styles.confirmationSection}>
            <Text style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
              Team:
            </Text>
            <Text style={[styles.confirmationValue, { color: colors.text }]}>
              {match?.settings?.teamNames?.[players.find(p => p.id === selectedPlayerId)?.team] || 'Unknown'}
            </Text>
          </View>

          {renderJoinButton()}
        </View>
      </Card>
    </View>
  );

  // Render join button
  const renderJoinButton = () => (
    <View style={styles.buttonContainer}>
      {!user ? (
        <View style={styles.authSection}>
          <Text style={[styles.authText, { color: colors.textSecondary }]}>
            Sign in to join this match
          </Text>
          <Button
            variant="primary"
            size="large"
            onPress={handleSignIn}
            style={styles.authButton}
            testID="sign-in-button"
          >
            Sign In
          </Button>
        </View>
      ) : (
        <Button
          variant="primary"
          size="large"
          onPress={handleJoinMatch}
          loading={joining}
          disabled={joining}
          style={styles.joinButton}
          testID="confirm-join-button"
        >
          {joining ? 'Joining...' : 'Join Match'}
        </Button>
      )}
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading match...
          </Text>
        </View>
      </View>
    );
  }

  // Render based on current state
  if (!scanned) {
    return renderJoinOptions();
  } else if (!selectedPlayerId) {
    return renderPlayerSelection();
  } else {
    return renderJoinConfirmation();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  card: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.title1,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
  },
  teamSection: {
    marginBottom: SPACING.lg,
  },
  teamTitle: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    marginBottom: SPACING.sm,
  },
  playerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  playerCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 2,
  },
  playerAvatar: {
    marginBottom: SPACING.sm,
  },
  playerName: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  playerStatus: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
  },
  backButton: {
    marginTop: SPACING.md,
  },
  confirmationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  confirmationLabel: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  confirmationValue: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  buttonContainer: {
    marginTop: SPACING.xl,
  },
  joinButton: {
    marginTop: SPACING.md,
  },
  authSection: {
    alignItems: 'center',
  },
  authText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  authButton: {
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: SPACING.md,
  },
}); 