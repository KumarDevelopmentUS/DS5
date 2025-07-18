// types/models.ts
import {
  MatchStatus,
  NotificationType,
  PlayType,
  PrivacyLevel,
  Theme,
  UserRole,
} from './enums';

// ============================================
// USER RELATED INTERFACES
// ============================================

// Represents a user's public and private profile information
export interface User {
  id: string; // Corresponds to Supabase auth user ID
  username: string;
  nickname?: string;
  avatarUrl?: string;
  school?: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  settings: UserSettings;
}

// User-specific settings for personalization
export interface UserSettings {
  theme?: Theme;
  notifications?: NotificationSettings;
  privacy?: PrivacySettings;
}

export interface NotificationSettings {
  matchInvites: boolean;
  friendRequests: boolean;
  communityPosts: boolean;
  matchUpdates: boolean;
  achievements: boolean;
  pushEnabled: boolean;
}

export interface PrivacySettings {
  profileVisibility: PrivacyLevel;
  showStats: boolean;
  showAchievements: boolean;
  allowFriendRequests: boolean;
}

// ============================================
// MATCH RELATED INTERFACES
// ============================================

// Represents a single game match
export interface Match {
  id: string; // Unique identifier
  roomCode: string; // Short, shareable code for joining
  title: string;
  description?: string;
  creatorId: string;
  status: MatchStatus; // From our enum
  gameType: string;
  settings: MatchConfig;
  location?: string;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  isPublic: boolean;
  participants?: Player[]; // Optional, loaded when needed
  currentScore?: TeamScore; // Optional, for active matches
}

// Configuration options for a match
export interface MatchConfig {
  scoreLimit?: number;
  timeLimit?: number;
  teamSize?: number;
  winByTwo?: boolean;
  sinkPoints?: number; // 3 or 5 points for sink
  specialRules?: Record<string, any>;
}

// Represents a player in a match
export interface Player {
  userId: string;
  username: string;
  nickname?: string;
  avatarUrl?: string;
  team?: string;
  role: UserRole;
  isActive: boolean;
  joinedAt: Date;
  stats?: PlayerMatchStats; // Stats for this specific match
}

// Team information during a match
export interface Team {
  id: string;
  name: string;
  color?: string;
  players: Player[];
  score: number;
}

// Score tracking for teams
export interface TeamScore {
  [teamId: string]: number;
}

// Represents an event/play during a match
export interface MatchEvent {
  id: string;
  matchId: string;
  playerId: string;
  eventType: PlayType;
  eventData: EventData;
  team?: string;
  timestamp: Date;
}

// Data associated with a match event
export interface EventData {
  throwType?: PlayType;
  defenderIds?: string[];
  defenseType?: PlayType;
  points?: number;
  fifa?: {
    kickType: 'good_kick' | 'bad_kick';
    saved?: boolean;
  };
  redemption?: {
    success: boolean;
    targetPlayerId?: string;
  };
  onFire?: boolean;
  hitStreak?: number;
}

// Player statistics within a match
export interface PlayerMatchStats {
  throws: number;
  hits: number;
  catches: number;
  catchAttempts: number;
  score: number;
  sinks: number;
  goals: number;
  dinks: number;
  knickers: number;
  currentStreak: number;
  longestStreak: number;
  onFireCount: number;
  blunders: number;
  fifaAttempts: number;
  fifaSuccess: number;
}

// ============================================
// SOCIAL FEATURES INTERFACES
// ============================================

// Represents a community group
export interface Community {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  creatorId: string;
  school?: string;
  isPrivate: boolean;
  canJoin: boolean;
  memberCount: number;
  settings: CommunitySettings;
  createdAt: Date;
  updatedAt: Date;
  userRole?: UserRole; // Current user's role in this community
}

export interface CommunitySettings {
  autoModeration: boolean;
  postApproval: boolean;
  allowGuests: boolean;
  minAccountAge?: number; // Days
}

// Represents a post in a community
export interface Post {
  id: string;
  authorId: string;
  author?: User; // Populated when needed
  communityId: string;
  community?: Community; // Populated when needed
  title?: string;
  content: string;
  matchId?: string; // Reference to a match if it's a match recap
  match?: Match; // Populated when needed
  mediaUrls: string[];
  isPinned: boolean;
  voteCount: number;
  commentCount: number;
  userVote?: 1 | -1 | null; // Current user's vote
  createdAt: Date;
  updatedAt: Date;
}

// Represents a comment on a post
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author?: User; // Populated when needed
  parentId?: string; // For nested comments
  content: string;
  replies?: Comment[]; // Nested replies
  voteCount: number;
  userVote?: 1 | -1 | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// FRIEND SYSTEM INTERFACES
// ============================================

// Represents a friend relationship
export interface Friend {
  id: string; // The friend's user ID
  username: string;
  nickname?: string;
  avatarUrl?: string;
  school?: string;
  status: 'pending' | 'accepted' | 'blocked';
  isOnline?: boolean;
  lastSeen?: Date;
  mutualFriends?: number;
  friendSince?: Date;
}

// Friend request information
export interface FriendRequest {
  id: string;
  fromUser: User;
  toUserId: string;
  message?: string;
  createdAt: Date;
}

// ============================================
// NOTIFICATION INTERFACE
// ============================================

// Represents an in-app notification
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  data: NotificationData;
  isRead: boolean;
  createdAt: Date;
}

// Data payload for different notification types
export interface NotificationData {
  matchId?: string;
  userId?: string;
  communityId?: string;
  postId?: string;
  achievementId?: string;
  // Additional fields based on notification type
  [key: string]: any;
}

// ============================================
// STATISTICS INTERFACES
// ============================================

// Comprehensive player statistics
export interface PlayerStats {
  userId: string;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  totalThrows: number;
  totalHits: number;
  hitRate: number;
  totalCatches: number;
  totalCatchAttempts: number;
  catchRate: number;
  totalScore: number;
  avgScore: number;
  totalSinks: number;
  totalGoals: number;
  totalDinks: number;
  totalKnickers: number;
  longestStreak: number;
  totalOnFireCount: number;
  totalOnFireLength: number;
  totalMatchDuration: number; // in seconds
  avgMatchDuration: number;
  favoriteArena?: string;
  nemesisPlayer?: User;
  bestPartner?: User;
  achievements: Achievement[];
  lastPlayed?: Date;
  updatedAt: Date;
}

// Achievement information
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress: number;
  maxProgress: number;
  unlockedAt?: Date;
  category: 'throwing' | 'catching' | 'winning' | 'special' | 'social';
}

// ============================================
// UI, PAGINATION, and RESPONSE INTERFACES
// ============================================

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  user: User;
  value: number;
  trend?: 'up' | 'down' | 'same';
  change?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// Parameters for requesting paginated data
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Metadata about the current page of a paginated response
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages?: number;
  totalCount?: number;
}

// A generic response for a list of items with pagination
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
  hasMore: boolean;
  totalCount?: number;
}

// ============================================
// FORM/INPUT INTERFACES
// ============================================

// Generic form state
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Match creation form data
export interface MatchFormData {
  title: string;
  description?: string;
  gameType: string;
  location?: string;
  scoreLimit: number;
  winByTwo: boolean;
  sinkPoints: number;
  isPublic: boolean;
}

// Profile edit form data
export interface ProfileFormData {
  username: string;
  nickname?: string;
  school?: string;
  isPublic: boolean;
  theme: Theme;
  notifications: NotificationSettings;
}

// Live player statistics for a specific match (stored in match document)
export interface LivePlayerStats {
  // Basic info
  name: string;
  
  // Throwing statistics
  throws: number;
  hits: number;
  score: number;
  
  // Specific throw types (from rulebook)
  tableDie: number;
  line: number;
  hit: number;
  knicker: number;
  goal: number;
  dink: number;
  sink: number;
  short: number;
  long: number;
  side: number;
  height: number;
  
  // Defensive statistics
  catches: number;
  catchPlusAura: number;
  drop: number;
  miss: number;
  twoHands: number;
  body: number;
  
  // FIFA statistics
  fifaAttempts: number;
  fifaSuccess: number;
  goodKick: number;
  badKick: number;
  
  // Streak and special
  hitStreak: number;
  currentlyOnFire: boolean;
  onFireCount: number;
  
  // Blunders and special throws
  blunders: number;
  specialThrows: number;
  lineThrows: number;
  
  // Aura (special defensive stat)
  aura: number;
}

// Live match data structure (stored in match document)
export interface LiveMatchData {
  // Live player statistics for all 4 positions
  livePlayerStats: {
    [position: string]: LivePlayerStats; // "1", "2", "3", "4"
  };
  
  // Team penalties
  liveTeamPenalties: {
    [teamId: string]: number; // "1", "2"
  };
  
  // Match setup (from your example)
  matchSetup: {
    arena: string;
    gameScoreLimit: number;
    sinkPoints: number;
    winByTwo: boolean;
    title: string;
    teamNames: {
      [teamId: string]: string; // "1", "2"
    };
    playerNames: {
      [position: string]: string; // "1", "2", "3", "4"
    };
  };
  
  // Participants and player mapping
  participants: string[]; // Array of user IDs
  playerMap: {
    [userId: string]: string; // Maps user ID to position "1", "2", "3", "4"
  };
  
  // Recent plays (last 4 as requested)
  recentPlays: any[]; // Array of the last 4 plays
  
  // Match info
  roomCode: string;
  status: string;
}
