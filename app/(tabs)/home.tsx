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
import { SPACING, TYPOGRAPHY, BORDERS, SHADOWS } from '../../constants/theme';
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
    // Navigate to join match screen - user will need to enter room code
    router.push('/match/join/input' as any);
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

  // Header - Clean, minimal design
  header: {
    marginBottom: SPACING.xl,
  },
  welcomeSection: {
    marginBottom: SPACING.lg,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.body * 1.4,
  },
  userNameText: {
    fontSize: TYPOGRAPHY.sizes.largeTitle,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginTop: SPACING.xs,
    lineHeight: TYPOGRAPHY.sizes.largeTitle * 1.1,
  },
  guestText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: SPACING.sm,
    lineHeight: TYPOGRAPHY.sizes.footnote * 1.4,
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  authButtons: {
    flexDirection: 'column',
    gap: SPACING.sm,
    width: '100%',
  },
  authButton: {
    flex: 1,
  },
  guestCreateButton: {
    flex: 1,
    marginTop: SPACING.xs,
  },
  createButton: {
    flex: 1,
  },
  joinButton: {
    flex: 1,
  },

  // Sections - Consistent card styling
  sectionCard: {
    marginBottom: SPACING.lg,
    borderRadius: BORDERS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    ...SHADOWS.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.title2,
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    lineHeight: TYPOGRAPHY.sizes.title2 * 1.2,
  },
  sectionAction: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#007AFF',
  },

  // Stats - Clean grid layout
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.title1,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.xs,
    lineHeight: TYPOGRAPHY.sizes.title1 * 1.1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.caption1 * 1.3,
    opacity: 0.7,
  },

  // Matches - Clean list styling
  matchesList: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  matchCard: {
    padding: SPACING.md,
    borderRadius: BORDERS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  matchTitle: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    flex: 1,
    lineHeight: TYPOGRAPHY.sizes.callout * 1.3,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDERS.full,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.caption2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#FFFFFF',
  },
  matchDetails: {
    gap: SPACING.xs,
  },
  matchInfo: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.footnote * 1.4,
    opacity: 0.8,
  },
  matchScore: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    lineHeight: TYPOGRAPHY.sizes.footnote * 1.4,
  },
  matchTime: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.footnote * 1.4,
    opacity: 0.6,
  },

  // Activity - Clean list styling
  activityList: {
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.xs,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
    marginTop: SPACING.xxs,
    opacity: 0.8,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: SPACING.xxs,
    lineHeight: TYPOGRAPHY.sizes.callout * 1.3,
  },
  activitySubtitle: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginBottom: SPACING.xxs,
    lineHeight: TYPOGRAPHY.sizes.footnote * 1.4,
    opacity: 0.7,
  },
  activityTime: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.caption1 * 1.3,
    opacity: 0.5,
  },

  // Empty state - Clean, centered design
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: TYPOGRAPHY.sizes.title3 * 1.3,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.body * 1.4,
    opacity: 0.7,
  },
});

export default HomeScreen;
