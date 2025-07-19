import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/auth/useAuth';
import {
  usePlayerStats,
  PlayerStatsData,
} from '../../hooks/analytics/usePlayerStats';
import { useTheme } from '../../hooks/ui/useTheme';
import { SimpleScreen } from '../../components/Layout/Screen/SimpleScreen';
import { Avatar } from '../../components/core/Avatar';
import { Button } from '../../components/core/Button';
import { Spinner, EmptyState } from '../../components/Layout/LoadingStates';
import {
  StatsGrid,
  ComparisonRow,
  StatCard,
} from '../../components/match/Stats';
import {
  AchievementGrid,
  Achievement as GridAchievement,
} from '../../components/social/AchievementGrid';
import { SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';
import { router, useRouter } from 'expo-router';
import { User, PlayerStats, Achievement } from '../../types/models';

type ProfileTab = 'overview' | 'stats' | 'achievements';

// This is a subset of the User model, matching what useAuth().profile provides
type UserProfile = Pick<User, 'id' | 'username' | 'avatarUrl'> | null;

// Maps achievement tiers from the database to rarity levels for the UI component
const mapTierToRarity = (
  tier: Achievement['tier']
): GridAchievement['rarity'] => {
  switch (tier) {
    case 'bronze':
      return 'common';
    case 'silver':
      return 'uncommon';
    case 'gold':
      return 'rare';
    case 'platinum':
      return 'epic';
    default:
      return 'common';
  }
};

// Helper to transform achievement data from the hook to the grid component's expected format
const transformAchievementsForGrid = (
  achievements: Achievement[]
): GridAchievement[] => {
  return achievements.map((ach) => ({
    id: ach.id,
    title: ach.name,
    description: ach.description,
    icon: ach.icon,
    unlocked: !!ach.unlockedAt,
    unlockedAt: ach.unlockedAt,
    rarity: mapTierToRarity(ach.tier),
  }));
};

// ==================================
// Profile Header Component
// ==================================
interface ProfileHeaderProps {
  profile: UserProfile;
  stats: PlayerStats | null;
  ranking: PlayerStatsData['ranking'];
}

const ProfileHeader = ({ profile, stats, ranking }: ProfileHeaderProps) => {
  const { colors } = useTheme();
  const { signOut } = useAuth();

  const onEditPress = () => {
    // To fix the route error, ensure you have a file at app/settings.tsx
    router.push('/settings' as any);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTopRow}>
        <Avatar
          source={profile?.avatarUrl}
          name={profile?.username || ''}
          size="xlarge"
        />
        <View style={styles.headerStats}>
          <View style={styles.headerStatItem}>
            <Text style={[styles.headerStatValue, { color: colors.text }]}>
              {stats?.totalMatches || 0}
            </Text>
            <Text
              style={[styles.headerStatLabel, { color: colors.textSecondary }]}
            >
              Matches
            </Text>
          </View>
          <View style={styles.headerStatItem}>
            <Text style={[styles.headerStatValue, { color: colors.text }]}>
              {ranking?.globalRank || 'N/A'}
            </Text>
            <Text
              style={[styles.headerStatLabel, { color: colors.textSecondary }]}
            >
              Rank
            </Text>
          </View>
          <View style={styles.headerStatItem}>
            <Text style={[styles.headerStatValue, { color: colors.text }]}>
              {stats?.totalWins || 0}
            </Text>
            <Text
              style={[styles.headerStatLabel, { color: colors.textSecondary }]}
            >
              Wins
            </Text>
          </View>
        </View>
      </View>
      <Text style={[styles.username, { color: colors.text }]}>
        {profile?.username || 'Anonymous Player'}
      </Text>
      <Text style={[styles.userHandle, { color: colors.textSecondary }]}>
        @{profile?.username?.toLowerCase() || 'player'}
      </Text>
      <View style={styles.headerActions}>
        <Button
          onPress={onEditPress}
          variant="outline"
          size="small"
          style={{ flex: 1, marginRight: SPACING.sm }}
        >
          Edit Profile
        </Button>
        <Button
          onPress={signOut}
          variant="ghost"
          size="small"
          style={{ flex: 1 }}
        >
          Logout
        </Button>
      </View>
    </View>
  );
};

// ==================================
// Segmented Control Component
// ==================================
const SegmentedControl = ({
  selected,
  onSelect,
}: {
  selected: ProfileTab;
  onSelect: (tab: ProfileTab) => void;
}) => {
  const { colors } = useTheme();
  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'stats', label: 'Stats' },
    { key: 'achievements', label: 'Trophies' },
  ];

  return (
    <View style={[styles.segmentedControl, { backgroundColor: colors.fill }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.segmentTab,
            selected === tab.key && { backgroundColor: colors.background },
          ]}
          onPress={() => onSelect(tab.key)}
        >
          <Text
            style={[
              styles.segmentLabel,
              {
                color:
                  selected === tab.key ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ==================================
// Main Profile Screen Component
// ==================================
export default function ProfileScreen() {
  const { user, profile, isAuthenticated, isGuest } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  // State management
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Player stats hook
  const {
    data: playerStats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = usePlayerStats(user?.id);

  // Handle authentication actions
  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchStats();
    } finally {
      setRefreshing(false);
    }
  }, [refetchStats]);

  // Render guest content
  const renderGuestContent = () => (
    <View style={styles.guestContent}>
      <View style={styles.guestIconContainer}>
        <Ionicons name="person-circle" size={80} color={colors.primary} />
      </View>
      <Text style={[styles.guestTitle, { color: colors.text }]}>
        Welcome to Your Profile
      </Text>
      <Text style={[styles.guestMessage, { color: colors.textSecondary }]}>
        Sign in to view your stats, achievements, and track your progress.
      </Text>
      <View style={styles.guestButtons}>
        <Button
          variant="primary"
          size="large"
          onPress={handleSignIn}
          icon={<Ionicons name="log-in" size={20} color="#FFFFFF" />}
          style={styles.guestButton}
        >
          Sign In
        </Button>
        <Button
          variant="outline"
          size="large"
          onPress={handleSignUp}
          icon={<Ionicons name="person-add" size={20} color="#000000" />}
          style={styles.guestButton}
        >
          Sign Up
        </Button>
      </View>
    </View>
  );

  // Render content based on authentication status
  const renderContent = () => {
    if (isGuest) {
      return renderGuestContent();
    }

    if (!user || !profile) {
      return <Spinner />;
    }

    switch (activeTab) {
      case 'overview':
        return (
          <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            <ProfileHeader
              profile={profile}
              stats={playerStats?.stats || null}
              ranking={playerStats?.ranking || { globalRank: 'N/A', percentile: 0 }}
            />
            <SegmentedControl selected={activeTab} onSelect={setActiveTab} />
            <View style={styles.overviewContent}>
              <StatsGrid 
                stats={
                  playerStats?.stats ? [
                    {
                      label: 'Win Rate',
                      value: `${playerStats.stats.winRate?.toFixed(1) || '0'}%`,
                      icon: 'podium-outline',
                      color: colors.primary,
                      description: `${playerStats.stats.totalMatches || 0} matches`,
                    },
                    {
                      label: 'Hit Rate',
                      value: `${playerStats.stats.hitRate?.toFixed(1) || '0'}%`,
                      icon: 'target-outline',
                      color: colors.success,
                      description: `${playerStats.stats.totalHits || 0} hits`,
                    },
                    {
                      label: 'Catch Rate',
                      value: `${playerStats.stats.catchRate?.toFixed(1) || '0'}%`,
                      icon: 'hand-left-outline',
                      color: colors.secondary,
                      description: `${playerStats.stats.totalCatches || 0} catches`,
                    },
                    {
                      label: 'Best Streak',
                      value: playerStats.stats.longestStreak || 0,
                      icon: 'flame-outline',
                      color: colors.warning,
                      description: 'Consecutive wins',
                    },
                  ] : []
                }
              />
              {playerStats?.stats && (
                <ComparisonRow 
                  data={{
                    label: 'Win/Loss Ratio',
                    value1: playerStats.stats.totalWins || 0,
                    value2: playerStats.stats.totalLosses || 0,
                    unit: '',
                    showDifference: true,
                    invertComparison: false,
                  }}
                  player1Name="Wins"
                  player2Name="Losses"
                />
              )}
            </View>
          </ScrollView>
        );

      case 'stats':
        return (
          <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            <ProfileHeader
              profile={profile}
              stats={playerStats?.stats || null}
              ranking={playerStats?.ranking || { globalRank: 'N/A', percentile: 0 }}
            />
            <SegmentedControl selected={activeTab} onSelect={setActiveTab} />
            <View style={styles.statsContent}>
              {isLoadingStats ? (
                <Spinner />
              ) : playerStats?.stats ? (
                <View style={styles.statsCards}>
                  <StatCard
                    title="Win Rate"
                    value={`${playerStats.stats.winRate?.toFixed(1) || '0'}%`}
                    subtitle={`From ${playerStats.stats.totalMatches || 0} matches`}
                    icon="podium-outline"
                    size="large"
                    color={colors.primary}
                  />
                  <StatCard
                    title="Hit Rate"
                    value={`${playerStats.stats.hitRate?.toFixed(1) || '0'}%`}
                    subtitle={`${playerStats.stats.totalHits || 0} hits`}
                    icon="target-outline"
                    size="large"
                    color={colors.success}
                  />
                  <StatCard
                    title="Catch Rate"
                    value={`${playerStats.stats.catchRate?.toFixed(1) || '0'}%`}
                    subtitle={`${playerStats.stats.totalCatches || 0} catches`}
                    icon="hand-left-outline"
                    size="large"
                    color={colors.secondary}
                  />
                </View>
              ) : (
                <EmptyState
                  title="No Stats Available"
                  message="Play some matches to see your statistics here."
                />
              )}
            </View>
          </ScrollView>
        );

      case 'achievements':
        return (
          <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            <ProfileHeader
              profile={profile}
              stats={playerStats?.stats || null}
              ranking={playerStats?.ranking || { globalRank: 'N/A', percentile: 0 }}
            />
            <SegmentedControl selected={activeTab} onSelect={setActiveTab} />
            <View style={styles.achievementsContent}>
              {isLoadingStats ? (
                <Spinner />
              ) : playerStats?.achievements ? (
                <AchievementGrid
                  achievements={transformAchievementsForGrid(playerStats.achievements)}
                />
              ) : (
                <EmptyState
                  title="No Achievements"
                  message="Complete challenges to unlock achievements."
                />
              )}
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SimpleScreen showHeader={false}>
      {renderContent()}
    </SimpleScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.body * 1.4,
    opacity: 0.7,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.body * 1.4,
    opacity: 0.7,
  },
  
  // Header - Clean, centered design
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  headerStatItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  headerStatValue: {
    fontSize: TYPOGRAPHY.sizes.title2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    lineHeight: TYPOGRAPHY.sizes.title2 * 1.2,
  },
  headerStatLabel: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: SPACING.xs,
    lineHeight: TYPOGRAPHY.sizes.caption1 * 1.3,
    opacity: 0.7,
  },
  username: {
    fontSize: TYPOGRAPHY.sizes.largeTitle,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    lineHeight: TYPOGRAPHY.sizes.largeTitle * 1.1,
    marginBottom: SPACING.xs,
  },
  userHandle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginBottom: SPACING.lg,
    lineHeight: TYPOGRAPHY.sizes.body * 1.4,
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
  },
  
  // Segmented Control - Clean, minimal design
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: BORDERS.lg,
    padding: SPACING.xxs,
    marginBottom: SPACING.lg,
    marginHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  segmentTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabel: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    lineHeight: TYPOGRAPHY.sizes.footnote * 1.3,
  },
  
  // Content sections - Consistent spacing
  contentContainer: {
    gap: SPACING.md,
  },
  content: {
    flex: 1,
  },
  overviewContent: {
    gap: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  statsContent: {
    padding: SPACING.md,
  },
  achievementsContent: {
    padding: SPACING.md,
  },
  statsCards: {
    gap: SPACING.lg,
  },
  
  // Guest content - Clean, centered design
  guestContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  guestIconContainer: {
    marginBottom: SPACING.xl,
  },
  guestTitle: {
    fontSize: TYPOGRAPHY.sizes.largeTitle,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.md,
    lineHeight: TYPOGRAPHY.sizes.largeTitle * 1.1,
    textAlign: 'center',
  },
  guestMessage: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.sizes.body * 1.4,
    opacity: 0.7,
  },
  guestButtons: {
    width: '100%',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  guestButton: {
    flex: 1,
  },
});
