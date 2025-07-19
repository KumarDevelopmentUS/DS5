// app/match/join/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/core/Button';
import { Card } from '../../../components/core/Card';
import { Avatar } from '../../../components/core/Avatar';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useTheme } from '../../../hooks/ui/useTheme';
import { EnhancedMatchService } from '../../../services/match/enhancedMatchService';
import { SPACING, TYPOGRAPHY, BORDERS } from '../../../constants/theme';

type JoinMatchParams = {
  id: string;
  player?: string;
  user?: string;
  code?: string;
}

/**
 * Join Match Screen
 * 
 * Allows users to join an existing match by selecting a player slot.
 * Supports QR code scanning, deep linking, and manual room code entry.
 */
export default function JoinMatchScreen() {
  const { id, player, user: userNameFromLink, code } = useLocalSearchParams<JoinMatchParams>();
  const router = useRouter();
  const { colors } = useTheme();
  const { user, profile, signIn } = useAuth();
  
  const [match, setMatch] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  // Load match data
  useEffect(() => {
    if (id) {
      // Check if this is a UUID or room code
      if (id.length === 36 && id.includes('-')) {
        // This is a UUID, load match data normally
        loadMatchData();
      } else {
        // This might be a room code, redirect to the new route
        router.replace(`/match/join/code/${id}`);
      }
    }
  }, [id]);

  // Handle code parameter from QR code
  useEffect(() => {
    if (code && match) {
      // Verify the code matches the room code
      if (code === match.roomCode) {
        console.log('Valid room code from QR code, proceeding to join');
        setScanned(true);
      } else {
        console.log('Invalid room code from QR code');
        Alert.alert('Invalid Code', 'The room code does not match this match');
      }
    }
  }, [code, match]);

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

  const loadMatchData = async () => {
    try {
      setLoading(true);
      const result = await EnhancedMatchService.getMatchById(id);
      
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
            const participant = result.data?.participants?.find((p: any) => {
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
        Alert.alert('Error', 'Match not found or invalid match ID');
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
    // Navigate to sign in screen
    router.push('/(auth)/login');
  };

  const renderJoinOptions = () => (
    <View style={styles.joinOptionsContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Join Match
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        Choose how you'd like to join this match
      </Text>
      
      <View style={styles.joinOptionsGrid}>
        {/* QR Code Option */}
        <Card
          style={styles.joinOptionCard}
          onPress={handleJoinOption}
        >
          <View style={styles.joinOptionContent}>
            <Ionicons name="qr-code" size={32} color={colors.primary} />
            <Text style={[styles.joinOptionTitle, { color: colors.text }]}>
              Scan QR Code
            </Text>
            <Text style={[styles.joinOptionSubtitle, { color: colors.textSecondary }]}>
              Use your camera app to scan the QR code
            </Text>
          </View>
        </Card>

        {/* Manual Entry Option */}
        <Card
          style={styles.joinOptionCard}
          onPress={handleJoinOption}
        >
          <View style={styles.joinOptionContent}>
            <Ionicons name="create" size={32} color={colors.primary} />
            <Text style={[styles.joinOptionTitle, { color: colors.text }]}>
              Manual Entry
            </Text>
            <Text style={[styles.joinOptionSubtitle, { color: colors.textSecondary }]}>
              Enter the room code manually
            </Text>
          </View>
        </Card>
      </View>

      {/* Room Code Display */}
      <View style={styles.roomCodeSection}>
        <Text style={[styles.roomCodeLabel, { color: colors.textSecondary }]}>
          Room Code:
        </Text>
        <Text style={[styles.roomCodeText, { color: colors.text }]}>
          {match?.roomCode}
        </Text>
      </View>
    </View>
  );

  const renderPlayerSelection = () => (
    <View style={styles.playerSelectionContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Select Your Player Slot
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        Choose an available slot below for your team. Your nickname (hero) will appear on the hosts tracker.
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        If you select the wrong slot, create a new match and join again.
      </Text>

      {/* Team 1 */}
      <View style={styles.teamSection}>
        <Text style={[styles.teamTitle, { color: colors.text }]}>Team 1</Text>
        <View style={styles.teamPlayersGrid}>
          {players.slice(0, 2).map((playerSlot, index) => {
            const isSelected = selectedPlayerId === playerSlot.id;
            const isAvailable = !playerSlot.userId;
            
            return (
              <Card
                key={playerSlot.id}
                style={[
                  styles.playerCard,
                  ...(isSelected ? [{ borderColor: colors.primary, borderWidth: 2 }] : []),
                  ...(!isAvailable ? [{ opacity: 0.5 }] : [])
                ]}
                onPress={() => isAvailable && handlePlayerSelect(playerSlot.id)}
                disabled={!isAvailable}
              >
                <View style={styles.playerCardContent}>
                  <Avatar
                    source={playerSlot.avatarUrl}
                    size="medium"
                    style={styles.playerAvatar}
                  />
                  <Text style={[styles.playerName, { color: colors.text }]}>
                    {playerSlot.name}
                  </Text>
                  
                  {!isAvailable && (
                    <View style={styles.linkedIndicator}>
                      <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                      <Text style={[styles.linkedText, { color: colors.success }]}>
                        Joined
                      </Text>
                    </View>
                  )}
                  
                  {isAvailable && (
                    <Button
                      onPress={() => handlePlayerSelect(playerSlot.id)}
                      variant="primary"
                      size="small"
                      style={styles.joinButton}
                    >
                      Join as {playerSlot.name}
                    </Button>
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      </View>

      {/* Team 2 */}
      <View style={styles.teamSection}>
        <Text style={[styles.teamTitle, { color: colors.text }]}>Team 2</Text>
        <View style={styles.teamPlayersGrid}>
          {players.slice(2, 4).map((playerSlot, index) => {
            const isSelected = selectedPlayerId === playerSlot.id;
            const isAvailable = !playerSlot.userId;
            
            return (
              <Card
                key={playerSlot.id}
                style={[
                  styles.playerCard,
                  ...(isSelected ? [{ borderColor: colors.primary, borderWidth: 2 }] : []),
                  ...(!isAvailable ? [{ opacity: 0.5 }] : [])
                ]}
                onPress={() => isAvailable && handlePlayerSelect(playerSlot.id)}
                disabled={!isAvailable}
              >
                <View style={styles.playerCardContent}>
                  <Avatar
                    source={playerSlot.avatarUrl}
                    size="medium"
                    style={styles.playerAvatar}
                  />
                  <Text style={[styles.playerName, { color: colors.text }]}>
                    {playerSlot.name}
                  </Text>
                  
                  {!isAvailable && (
                    <View style={styles.linkedIndicator}>
                      <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                      <Text style={[styles.linkedText, { color: colors.success }]}>
                        Joined
                      </Text>
                    </View>
                  )}
                  
                  {isAvailable && (
                    <Button
                      onPress={() => handlePlayerSelect(playerSlot.id)}
                      variant="primary"
                      size="small"
                      style={styles.joinButton}
                    >
                      Join as {playerSlot.name}
                    </Button>
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      </View>
    </View>
  );

  const renderJoinConfirmation = () => (
    <View style={styles.simpleJoinContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Join Match
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        Your information will be sent to the host's tracker
      </Text>

      <View style={styles.joinInfoCard}>
        <View style={styles.joinInfoContent}>
          <Avatar
            source={profile?.avatarUrl}
            size="large"
            style={styles.userAvatarLarge}
          />
          <Text style={[styles.userNameLarge, { color: colors.text }]}>
            {profile?.username || user?.email || 'Unknown Player'}
          </Text>
          <Text style={[styles.joinDescription, { color: colors.textSecondary }]}>
            You'll appear as a player on the host's tracker and your stats will be tracked for future reference.
          </Text>
        </View>
      </View>

      {/* Back Button */}
      <Button
        onPress={handleBackToSelection}
        variant="secondary"
        size="medium"
        style={styles.backButton}
      >
        Change Position
      </Button>
    </View>
  );

  const renderJoinButton = () => (
    <View style={styles.joinButtonContainer}>
      {!user ? (
        <Button
          onPress={handleSignIn}
          variant="primary"
          size="large"
          style={styles.joinButton}
        >
          Sign In to Join Match
        </Button>
      ) : (
        <Button
          onPress={handleJoinMatch}
          variant="primary"
          size="large"
          disabled={!selectedPlayerId || joining}
          style={styles.joinButton}
        >
          {joining ? "Joining..." : "Join Match"}
        </Button>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading match...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Join Match
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Room Code: {match?.roomCode}
        </Text>
      </View>

      {/* Authentication Section */}
      <View style={styles.authSection}>
        {user ? (
          <View style={styles.userInfo}>
            <Avatar
              source={profile?.avatarUrl}
              size="small"
              style={styles.userAvatar}
            />
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {profile?.username || user.email}
              </Text>
              <Text style={[styles.userStatus, { color: colors.success }]}>
                Signed In
              </Text>
            </View>
            <Button
              onPress={() => router.push('/(auth)/login')}
              variant="secondary"
              size="small"
              style={styles.signOutButton}
            >
              Sign Out
            </Button>
          </View>
        ) : (
          <View style={styles.signInPrompt}>
            <Text style={[styles.signInText, { color: colors.textSecondary }]}>
              Sign in to join this match
            </Text>
            <Button
              onPress={handleSignIn}
              variant="primary"
              size="medium"
              style={styles.signInButton}
            >
              Sign In
            </Button>
          </View>
        )}
      </View>

      {/* Match Info */}
      {match && (
        <Card style={styles.matchInfoCard}>
          <Text style={[styles.matchTitle, { color: colors.text }]}>
            {match.title}
          </Text>
          {match.description && (
            <Text style={[styles.matchDescription, { color: colors.textSecondary }]}>
              {match.description}
            </Text>
          )}
          <View style={styles.matchMeta}>
            <View style={styles.matchMetaItem}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text style={[styles.matchMetaText, { color: colors.textSecondary }]}>
                {match.location || 'No location'}
              </Text>
            </View>
            <View style={styles.matchMetaItem}>
              <Ionicons name="people" size={16} color={colors.textSecondary} />
              <Text style={[styles.matchMetaText, { color: colors.textSecondary }]}>
                {players.length}/4 Players
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Join Options, Player Selection, or Join Confirmation */}
      {!scanned ? renderJoinOptions() : 
       !selectedPlayerId ? renderPlayerSelection() : renderJoinConfirmation()}

      {/* Join Button */}
      {scanned && selectedPlayerId && renderJoinButton()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingTop: SPACING.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.largeTitle,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    letterSpacing: 1,
  },
  authSection: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BORDERS.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  userAvatar: {
    marginRight: SPACING.xs,
  },
  userAvatarLarge: {
    marginBottom: SPACING.sm,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  userNameLarge: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    textAlign: 'center',
  },
  userStatus: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  signOutButton: {
    minWidth: 80,
  },
  signInPrompt: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  signInText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
  },
  signInButton: {
    minWidth: 120,
  },
  matchInfoCard: {
    marginBottom: SPACING.lg,
  },
  matchTitle: {
    fontSize: TYPOGRAPHY.sizes.title2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.xs,
  },
  matchDescription: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginBottom: SPACING.sm,
  },
  matchMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  matchMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  matchMetaText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  joinOptionsContainer: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },

  joinOptionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  joinOptionCard: {
    flex: 1,
    minHeight: 120,
  },
  joinOptionContent: {
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  joinOptionTitle: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    textAlign: 'center',
  },
  joinOptionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
  },
  roomCodeSection: {
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BORDERS.md,
  },
  roomCodeLabel: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: SPACING.xs,
  },
  roomCodeText: {
    fontSize: TYPOGRAPHY.sizes.largeTitle,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    letterSpacing: 2,
  },
  simpleJoinContainer: {
    marginBottom: SPACING.lg,
  },
  joinInfoCard: {
    marginTop: SPACING.md,
  },
  joinInfoContent: {
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  joinDescription: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  playerSelectionContainer: {
    marginBottom: SPACING.lg,
  },
  teamSection: {
    marginBottom: SPACING.lg,
  },
  teamTitle: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  teamPlayersGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  playerCard: {
    width: '45%',
    minWidth: 140,
  },
  playerCardContent: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  playerAvatar: {
    marginBottom: SPACING.xs,
  },
  playerName: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: 2,
    textAlign: 'center',
  },
  playerTeam: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginBottom: SPACING.xs,
  },
  linkedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkedText: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  joinButtonContainer: {
    marginTop: SPACING.lg,
  },
  joinButton: {
    width: '100%',
    marginTop: SPACING.xs,
  },
  backButton: {
    marginTop: SPACING.md,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
}); 