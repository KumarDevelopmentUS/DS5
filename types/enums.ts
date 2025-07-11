// types/enums.ts
export enum MatchStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export enum PlayType {
  // Basic outcomes
  ROLL = 'roll',
  BONUS = 'bonus',
  PENALTY = 'penalty',

  // Good throw options (from rulebook)
  TABLE = 'table',
  LINE = 'line',
  HIT = 'hit',
  KNICKER = 'knicker',
  GOAL = 'goal',
  DINK = 'dink',
  SINK = 'sink',

  // Bad throw options (from rulebook)
  SHORT = 'short',
  LONG = 'long',
  SIDE = 'side',
  HEIGHT = 'height',

  // Defense outcomes
  CATCH = 'catch',
  CATCH_PLUS_AURA = 'catch_plus_aura',
  DROP = 'drop',
  MISS = 'miss',
  TWO_HANDS = '2hands',
  BODY = 'body',

  // FIFA actions
  GOOD_KICK = 'good_kick',
  BAD_KICK = 'bad_kick',
  FIFA_SAVE = 'fifa_save',

  // Special plays
  REDEMPTION = 'redemption',
  SELF_SINK = 'self_sink',
}

export enum UserRole {
  PLAYER = 'player',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum NotificationType {
  MATCH_INVITE = 'match_invite',
  FRIEND_REQUEST = 'friend_request',
  MATCH_UPDATE = 'match_update',
  COMMUNITY_POST = 'community_post',
  ACHIEVEMENT = 'achievement',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum PrivacyLevel {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private',
}
