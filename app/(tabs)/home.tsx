// app/(tabs)/home.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SimpleScreen } from '../../components/Layout/Screen/SimpleScreen';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button } from '../../components/core/Button';
import { Card } from '../../components/core/Card';
import { CreationModal } from '../../components/forms/CreationModal';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';
import { MESSAGES } from '../../constants/messages';
import { MATCH_ROUTES } from '../../constants/routes';

/**
 * Home Screen - Main Dashboard
 *
 * The main landing screen for all users (authenticated and guests). It acts as a dashboard,
 * presenting a unified hub of competitive activities, including a social feed,
 * active matches, and quick stats. Guests can access most features but are prompted to sign in.
 */
const HomeScreen = () => {
  const { user, profile, isAuthenticated, isGuest } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  // Local state
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - in real app, these would come from custom hooks
  const mockActiveMatches = [
    {
      id: '1',
      title: 'Epic Die Game',
      status: 'active',
      playerCount: 4,
      yourTeam: 'Red',
      score: { red: 8, blue: 6 },
      timeElapsed: '12:34',
    },
    {
      id: '2',
      title: 'Tournament Finals',
      status: 'pending',
      playerCount: 6,
      yourTeam: 'Blue',
      startTime: '2:30 PM',
    },
  ];

  const mockQuickStats = {
    totalMatches: 47,
    winRate: 68,
    currentStreak: 5,
    bestStreak: 12,
    totalWins: 32,
  };

  const mockRecentActivity = [
    {
      id: '1',
      type: 'match_win',
      title: 'Victory in Campus Tournament!',
      subtitle: 'Beat Team Alpha 15-12',
      time: '2 hours ago',
      icon: '🏆',
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      subtitle: 'Hit Streak Master - 10 consecutive hits',
      time: '1 day ago',
      icon: '🎯',
    },
    {
      id: '3',
      type: 'friend_activity',
      title: 'Sarah just won a match',
      subtitle: 'Dominated in "Friday Night Games"',
      time: '2 days ago',
      icon: '👥',
    },
  ];

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh - in real app, refresh all data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleCreateAction = () => {
    // Guests can create matches (with warning shown in CreationModal)
    setShowCreationModal(true);
  };

  const handleJoinMatch = () => {
    // Navigate to join match screen or show room code input
    router.push('/match/join' as any);
  };

  const handleViewMatch = (matchId: string) => {
    router.push(MATCH_ROUTES.live(matchId) as any);
  };

  const handleViewStats = () => {
    router.push('/(tabs)/profile');
  };

  const handleViewHistory = () => {
    router.push('/match/history' as any);
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };

  // Render welcome header
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
          {isGuest ? 'Welcome to' : 'Welcome back,'}
        </Text>
        <Text style={[styles.userNameText, { color: colors.text }]}>
          {isGuest 
            ? 'Die Stats!'
            : `${profile?.nickname || profile?.username || user?.email?.split('@')[0] || 'Player'}!`
          }
        </Text>
        {isGuest && (
          <Text style={[styles.guestText, { color: colors.textSecondary }]}>
            You're playing as a guest. Sign in to save your progress!
          </Text>
        )}
      </View>

      <View style={styles.headerActions}>
        {isGuest ? (
          // Guest authentication buttons and create match button
          <View style={styles.authButtons}>
            <Button
              variant="primary"
              size="large"
              onPress={handleSignIn}
              style={styles.authButton}
              testID="home-signin-button"
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              size="large"
              onPress={handleSignUp}
              style={styles.authButton}
              testID="home-signup-button"
            >
              Sign Up
            </Button>
            <Button
              variant="outline"
              size="medium"
              onPress={handleCreateAction}
              style={styles.guestCreateButton}
              testID="home-guest-create-button"
            >
              Create Match
            </Button>
          </View>
        ) : (
          // Authenticated user action buttons
          <>
            <Button
              variant="primary"
              size="medium"
              onPress={handleCreateAction}
              style={styles.createButton}
              testID="home-create-button"
            >
              {MESSAGES.GENERAL.CREATE}
            </Button>

            <Button
              variant="outline"
              size="medium"
              onPress={handleJoinMatch}
              style={styles.joinButton}
              testID="home-join-button"
            >
              {MESSAGES.BUTTON_LABELS.JOIN_MATCH}
            </Button>
          </>
        )}
      </View>
    </View>
  );

  // Render quick stats section
  const renderQuickStats = () => (
    <Card style={styles.sectionCard} pressable onPress={handleViewStats}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Stats
        </Text>
        <Text style={[styles.sectionAction, { color: colors.primary }]}>
          View All
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {mockQuickStats.totalMatches}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Matches
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {mockQuickStats.winRate}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Win Rate
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {mockQuickStats.currentStreak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Current Streak
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {mockQuickStats.bestStreak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Best Streak
          </Text>
        </View>
      </View>
    </Card>
  );

  // Render active matches section
  const renderActiveMatches = () => (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Active Matches
        </Text>
        <Pressable onPress={handleViewHistory}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>
            View History
          </Text>
        </Pressable>
      </View>

      {mockActiveMatches.length > 0 ? (
        <View style={styles.matchesList}>
          {mockActiveMatches.map((match) => (
            <Pressable
              key={match.id}
              style={[styles.matchCard, { backgroundColor: colors.surface }]}
              onPress={() => handleViewMatch(match.id)}
            >
              <View style={styles.matchHeader}>
                <Text style={[styles.matchTitle, { color: colors.text }]}>
                  {match.title}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        match.status === 'active'
                          ? colors.success
                          : colors.warning,
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {match.status === 'active' ? 'LIVE' : 'PENDING'}
                  </Text>
                </View>
              </View>

              <View style={styles.matchDetails}>
                <Text
                  style={[styles.matchInfo, { color: colors.textSecondary }]}
                >
                  {match.playerCount} players • Team {match.yourTeam}
                </Text>

                {match.status === 'active' && match.score ? (
                  <Text style={[styles.matchScore, { color: colors.text }]}>
                    {match.score.red} - {match.score.blue} • {match.timeElapsed}
                  </Text>
                ) : (
                  <Text
                    style={[styles.matchTime, { color: colors.textSecondary }]}
                  >
                    Starts at {match.startTime}
                  </Text>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {MESSAGES.EMPTY_STATES.NO_ACTIVE_MATCHES}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {MESSAGES.EMPTY_STATES.START_FIRST_MATCH}
          </Text>
        </View>
      )}
    </Card>
  );

  // Render recent activity feed
  const renderRecentActivity = () => (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Activity
        </Text>
        <Pressable onPress={() => router.push('/(tabs)/social')}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>
            View Feed
          </Text>
        </Pressable>
      </View>

      <View style={styles.activityList}>
        {mockRecentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <Text style={styles.activityIcon}>{activity.icon}</Text>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>
                {activity.title}
              </Text>
              <Text
                style={[
                  styles.activitySubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                {activity.subtitle}
              </Text>
              <Text
                style={[styles.activityTime, { color: colors.textSecondary }]}
              >
                {activity.time}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );

  return (
    <SimpleScreen
      showHeader={false}
      style={{ backgroundColor: colors.background }}
      testID="home-screen"
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {renderHeader()}
        {renderQuickStats()}
        {renderActiveMatches()}
        {renderRecentActivity()}
      </ScrollView>

      {/* Creation Modal */}
      <CreationModal
        visible={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        testID="home-creation-modal"
      />
    </SimpleScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  // Header
  header: {
    marginBottom: SPACING.lg,
  },
  welcomeSection: {
    marginBottom: SPACING.md,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  userNameText: {
    fontSize: TYPOGRAPHY.sizes.title2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginTop: SPACING.xs,
  },
  guestText: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: SPACING.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  authButtons: {
    flexDirection: 'column',
    gap: SPACING.md,
  },
  authButton: {
    flex: 1,
  },
  guestCreateButton: {
    flex: 1,
  },
  createButton: {
    flex: 1,
  },
  joinButton: {
    flex: 1,
  },

  // Sections
  sectionCard: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.headline,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  sectionAction: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.title2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
  },

  // Matches
  matchesList: {
    gap: SPACING.sm,
  },
  matchCard: {
    padding: SPACING.md,
    borderRadius: BORDERS.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  matchTitle: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDERS.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.caption2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#FFFFFF',
  },
  matchDetails: {
    gap: SPACING.xxs,
  },
  matchInfo: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  matchScore: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  matchTime: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },

  // Activity
  activityList: {
    gap: SPACING.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
    marginTop: SPACING.xxs,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: SPACING.xxs,
  },
  activitySubtitle: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginBottom: SPACING.xxs,
  },
  activityTime: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
  },
});

export default HomeScreen;
