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
import { Screen } from '../../components/Layout/Screen';
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
import { router } from 'expo-router';
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
  const { user, profile } = useAuth();
  const { stats, achievements, ranking, isLoading, isError, error, refetch } =
    usePlayerStats(user?.id);
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderContent = () => {
    if (isLoading && !stats) {
      return (
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading profile...
          </Text>
        </View>
      );
    }

    if (isError) {
      // Displaying a simple error message instead of the EmptyState component
      return (
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Error: {error?.message || 'Could not fetch your stats.'}
          </Text>
          <Button
            onPress={refetch}
            variant="primary"
            style={{ marginTop: SPACING.md }}
          >
            Try Again
          </Button>
        </View>
      );
    }

    if (!stats) {
      return (
        <EmptyState
          title="No Stats Yet"
          message="Play your first match to see your profile stats here!"
        />
      );
    }

    const gridAchievements = transformAchievementsForGrid(achievements);

    return (
      <>
        <ProfileHeader profile={profile} stats={stats} ranking={ranking} />
        <SegmentedControl selected={activeTab} onSelect={setActiveTab} />
        <View style={styles.contentContainer}>
          {activeTab === 'overview' && (
            <>
              <StatCard
                title="Win Rate"
                value={`${stats.winRate.toFixed(1)}%`}
                subtitle={`From ${stats.totalMatches} matches`}
                icon="podium-outline"
                size="large"
                color={colors.primary}
              />
              <AchievementGrid
                title="Recent Achievements"
                achievements={gridAchievements.slice(0, 4)}
              />
            </>
          )}
          {activeTab === 'stats' && (
            <>
              <ComparisonRow
                data={{
                  label: 'Win/Loss Ratio',
                  value1: stats.totalWins,
                  value2: stats.totalLosses,
                }}
                player1Name="Wins"
                player2Name="Losses"
              />
              <StatsGrid
                stats={[
                  { label: 'Hit Rate', value: `${stats.hitRate.toFixed(1)}%` },
                  {
                    label: 'Catch Rate',
                    value: `${stats.catchRate.toFixed(1)}%`,
                  },
                  { label: 'Total Sinks', value: stats.totalSinks },
                  { label: 'Longest Streak', value: stats.longestStreak },
                ]}
              />
            </>
          )}
          {activeTab === 'achievements' && (
            <AchievementGrid achievements={gridAchievements} />
          )}
        </View>
      </>
    );
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </Screen>
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
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.md,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  headerStatItem: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  headerStatLabel: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: SPACING.xxs,
  },
  username: {
    fontSize: TYPOGRAPHY.sizes.title1,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  userHandle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginBottom: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
    width: '100%',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: BORDERS.md,
    padding: SPACING.xxs,
    marginBottom: SPACING.lg,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabel: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  contentContainer: {
    gap: SPACING.md,
  },
});
