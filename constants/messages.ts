// constants/messages.ts

// ============================================
// GENERAL APP MESSAGES
// ============================================

export const GENERAL = {
  // Common actions
  SAVE: 'Save',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  EDIT: 'Edit',
  CREATE: 'Create',
  UPDATE: 'Update',
  CONFIRM: 'Confirm',
  BACK: 'Back',
  NEXT: 'Next',
  DONE: 'Done',
  CLOSE: 'Close',
  RETRY: 'Retry',
  REFRESH: 'Refresh',
  LOAD_MORE: 'Load More',
  VIEW_ALL: 'View All',
  SHARE: 'Share',
  COPY: 'Copy',
  SUBMIT: 'Submit',
  RESET: 'Reset',
  CLEAR: 'Clear',
  SEARCH: 'Search',
  FILTER: 'Filter',
  SORT: 'Sort',
  SELECT: 'Select',
  CHOOSE: 'Choose',
  UPLOAD: 'Upload',
  DOWNLOAD: 'Download',
  SEND: 'Send',
  INVITE: 'Invite',
  JOIN: 'Join',
  LEAVE: 'Leave',
  START: 'Start',
  STOP: 'Stop',
  PAUSE: 'Pause',
  RESUME: 'Resume',
  FINISH: 'Finish',

  // Status messages
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  CREATING: 'Creating...',
  UPDATING: 'Updating...',
  DELETING: 'Deleting...',
  PROCESSING: 'Processing...',
  SYNCING: 'Syncing...',
  CONNECTING: 'Connecting...',

  // Common feedback
  SUCCESS: 'Success!',
  ERROR: 'Error',
  WARNING: 'Warning',
  INFO: 'Information',
  COPIED: 'Copied!',
  SAVED: 'Saved!',
  DELETED: 'Deleted!',
  UPDATED: 'Updated!',
  CREATED: 'Created!',
  SENT: 'Sent!',

  // Navigation
  HOME: 'Home',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  HELP: 'Help',
  ABOUT: 'About',

  // Common placeholders
  SEARCH_PLACEHOLDER: 'Search...',
  TYPE_HERE: 'Type here...',
  OPTIONAL: 'Optional',
  REQUIRED: 'Required',

  // Time/Date
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  TOMORROW: 'Tomorrow',
  NOW: 'Now',
  NEVER: 'Never',

  // Boolean
  YES: 'Yes',
  NO: 'No',
  ON: 'On',
  OFF: 'Off',
  ENABLED: 'Enabled',
  DISABLED: 'Disabled',
  PUBLIC: 'Public',
  PRIVATE: 'Private',
  VISIBLE: 'Visible',
  HIDDEN: 'Hidden',
} as const;

// ============================================
// CREATION MODAL MESSAGES
// ============================================

export const CREATION_MODAL = {
  // Modal title and content
  TITLE: 'Create New',
  SUBTITLE: 'What would you like to create?',

  // Creation options
  OPTIONS: {
    MATCH: {
      TITLE: 'Start a Match',
      DESCRIPTION: 'Create a new game session',
      ICON_NAME: 'play-circle',
    },
    POST: {
      TITLE: 'Create Post',
      DESCRIPTION: 'Share with your community',
      ICON_NAME: 'edit',
    },
    COMMUNITY: {
      TITLE: 'New Community',
      DESCRIPTION: 'Start a new group',
      ICON_NAME: 'users',
    },
    TOURNAMENT: {
      TITLE: 'Host Tournament',
      DESCRIPTION: 'Organize a competition',
      ICON_NAME: 'trophy',
    },
    EVENT: {
      TITLE: 'Schedule Event',
      DESCRIPTION: 'Plan a meetup',
      ICON_NAME: 'calendar',
    },
  },

  // Actions
  CANCEL: GENERAL.CANCEL,
  SELECT_OPTION: 'Select an option to continue',
} as const;

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR:
    'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  OFFLINE_ERROR:
    'You are currently offline. Some features may not be available.',

  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid username or password.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  ACCOUNT_LOCKED: 'Your account has been temporarily locked.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address.',

  // Validation errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_USERNAME:
    'Username must be 3-20 characters and contain only letters, numbers, and underscores.',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_URL: 'Please enter a valid URL.',

  // File/Media errors
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'File type is not supported.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  CAMERA_PERMISSION: 'Camera permission is required to take photos.',
  GALLERY_PERMISSION: 'Photo library permission is required to select images.',

  // Match errors
  MATCH_NOT_FOUND: 'Match not found or no longer available.',
  CANNOT_JOIN_MATCH: 'Unable to join this match.',
  MATCH_FULL: 'This match is already full.',
  INVALID_ROOM_CODE: 'Invalid room code. Please check and try again.',
  MATCH_ALREADY_STARTED: 'This match has already started.',
  MATCH_ENDED: 'This match has already ended.',

  // Community errors
  COMMUNITY_NOT_FOUND: 'Community not found.',
  NOT_COMMUNITY_MEMBER: 'You are not a member of this community.',
  INSUFFICIENT_PERMISSIONS:
    'You do not have permission to perform this action.',
  COMMUNITY_PRIVATE: 'This community is private.',

  // Friend system errors
  FRIEND_REQUEST_EXISTS: 'Friend request already sent.',
  ALREADY_FRIENDS: 'You are already friends with this user.',
  CANNOT_ADD_SELF: 'You cannot add yourself as a friend.',
  USER_BLOCKED: 'This user has blocked you.',

  // Generic fallback
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
} as const;

// ============================================
// VALIDATION MESSAGES
// ============================================

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'Email address is required.',
  PASSWORD_REQUIRED: 'Password is required.',
  USERNAME_REQUIRED: 'Username is required.',
  TITLE_REQUIRED: 'Title is required.',
  DESCRIPTION_REQUIRED: 'Description is required.',
  NAME_REQUIRED: 'Name is required.',

  // Specific validations
  EMAIL_INVALID: ERROR_MESSAGES.INVALID_EMAIL,
  USERNAME_INVALID: ERROR_MESSAGES.INVALID_USERNAME,
  PASSWORD_TOO_SHORT: ERROR_MESSAGES.PASSWORD_TOO_SHORT,
  PASSWORD_MISMATCH: ERROR_MESSAGES.PASSWORD_MISMATCH,

  // Length validations
  TITLE_TOO_SHORT: 'Title must be at least 3 characters long.',
  TITLE_TOO_LONG: 'Title must be no more than 100 characters long.',
  DESCRIPTION_TOO_LONG: 'Description must be no more than 500 characters long.',
  COMMENT_TOO_LONG: 'Comment must be no more than 280 characters long.',

  // Match validations
  SCORE_LIMIT_REQUIRED: 'Score limit is required.',
  SCORE_LIMIT_INVALID: 'Score limit must be between 5 and 50.',
  TEAM_SIZE_INVALID: 'Team size must be between 1 and 10.',
  LOCATION_TOO_LONG: 'Location must be no more than 100 characters long.',
} as const;

// ============================================
// EMPTY STATE MESSAGES
// ============================================

export const EMPTY_STATES = {
  // Matches
  NO_MATCHES: 'No matches found',
  NO_ACTIVE_MATCHES: 'No active matches',
  NO_MATCH_HISTORY: 'No match history yet',
  START_FIRST_MATCH: 'Start your first match to see it here!',

  // Social
  NO_POSTS: 'No posts yet',
  NO_COMMENTS: 'No comments yet',
  NO_COMMUNITIES: 'No communities found',
  NO_FRIENDS: 'No friends yet',
  NO_FRIEND_REQUESTS: 'No friend requests',
  NO_NOTIFICATIONS: 'No notifications',

  // Search
  NO_SEARCH_RESULTS: 'No results found',
  TRY_DIFFERENT_SEARCH: 'Try searching with different keywords',
  NO_USERS_FOUND: 'No users found',

  // Analytics
  NO_STATS_AVAILABLE: 'No statistics available yet',
  PLAY_MORE_MATCHES: 'Play more matches to see your stats!',
  NO_ACHIEVEMENTS: 'No achievements unlocked yet',

  // Generic
  NOTHING_HERE: 'Nothing here yet',
  COMING_SOON: 'Coming soon!',
} as const;

// ============================================
// SUCCESS MESSAGES
// ============================================

export const SUCCESS_MESSAGES = {
  // Account/Auth
  ACCOUNT_CREATED: 'Account created successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  PASSWORD_RESET_SENT: 'Password reset instructions sent to your email.',

  // Profile
  PROFILE_UPDATED: 'Profile updated successfully.',
  AVATAR_UPDATED: 'Profile picture updated.',

  // Matches
  MATCH_CREATED: 'Match created successfully!',
  MATCH_JOINED: 'Successfully joined the match.',
  MATCH_LEFT: 'You have left the match.',
  MATCH_ENDED: 'Match completed!',
  INVITE_SENT: 'Invite sent successfully.',

  // Social
  POST_CREATED: 'Post shared successfully.',
  POST_UPDATED: 'Post updated successfully.',
  POST_DELETED: 'Post deleted successfully.',
  COMMENT_ADDED: 'Comment added successfully.',
  COMMENT_DELETED: 'Comment deleted successfully.',

  // Communities
  COMMUNITY_CREATED: 'Community created successfully!',
  COMMUNITY_JOINED: 'Successfully joined the community.',
  COMMUNITY_LEFT: 'You have left the community.',

  // Friends
  FRIEND_REQUEST_SENT: 'Friend request sent.',
  FRIEND_REQUEST_ACCEPTED: 'Friend request accepted.',
  FRIEND_REMOVED: 'Friend removed.',
  USER_BLOCKED: 'User blocked successfully.',
  USER_UNBLOCKED: 'User unblocked successfully.',

  // Settings
  SETTINGS_SAVED: 'Settings saved successfully.',
  PREFERENCES_UPDATED: 'Preferences updated.',
  NOTIFICATIONS_UPDATED: 'Notification settings updated.',

  // Data
  DATA_EXPORTED: 'Data exported successfully.',
  BACKUP_CREATED: 'Backup created successfully.',
  DATA_SYNCED: 'Data synced successfully.',

  // Generic
  CHANGES_SAVED: 'Changes saved successfully.',
  ACTION_COMPLETED: 'Action completed successfully.',
} as const;

// ============================================
// CONFIRMATION MESSAGES
// ============================================

export const CONFIRMATION_MESSAGES = {
  // Destructive actions
  DELETE_MATCH:
    'Are you sure you want to delete this match? This action cannot be undone.',
  DELETE_POST:
    'Are you sure you want to delete this post? This action cannot be undone.',
  DELETE_COMMENT: 'Are you sure you want to delete this comment?',
  DELETE_COMMUNITY:
    'Are you sure you want to delete this community? All posts and members will be removed.',
  DELETE_ACCOUNT:
    'Are you sure you want to delete your account? This action is permanent and cannot be undone.',

  // Leaving/Removing
  LEAVE_MATCH: 'Are you sure you want to leave this match?',
  LEAVE_COMMUNITY: 'Are you sure you want to leave this community?',
  REMOVE_FRIEND: 'Are you sure you want to remove this friend?',
  BLOCK_USER: 'Are you sure you want to block this user?',

  // Other actions
  DISCARD_CHANGES: 'Are you sure you want to discard your changes?',
  RESET_SETTINGS: 'Are you sure you want to reset all settings to default?',
  CLEAR_HISTORY: 'Are you sure you want to clear your match history?',
  END_MATCH: 'Are you sure you want to end this match?',

  // Generic
  CONTINUE_ACTION: 'Are you sure you want to continue?',
  PERMANENT_ACTION: 'This action is permanent and cannot be undone.',
} as const;

// ============================================
// NOTIFICATION MESSAGES
// ============================================

export const NOTIFICATION_MESSAGES = {
  // Match notifications
  MATCH_INVITE: 'You have been invited to join a match',
  MATCH_STARTING: 'Your match is about to start',
  MATCH_ENDED: 'Your match has ended',
  MATCH_UPDATE: 'Match update',

  // Social notifications
  FRIEND_REQUEST: 'New friend request',
  FRIEND_ACCEPTED: 'Friend request accepted',
  NEW_POST: 'New post in your community',
  POST_LIKED: 'Someone liked your post',
  NEW_COMMENT: 'New comment on your post',
  COMMENT_REPLY: 'Someone replied to your comment',
  MENTION: 'You were mentioned in a post',

  // Community notifications
  COMMUNITY_INVITE: 'You have been invited to join a community',
  COMMUNITY_UPDATE: 'Community update',
  NEW_MEMBER: 'New member joined your community',

  // Achievement notifications
  ACHIEVEMENT_UNLOCKED: 'Achievement unlocked!',
  NEW_BADGE: 'You earned a new badge',
  STREAK_MILESTONE: 'Streak milestone reached',

  // System notifications
  UPDATE_AVAILABLE: 'App update available',
  MAINTENANCE_NOTICE: 'Scheduled maintenance notice',
  FEATURE_ANNOUNCEMENT: 'New feature available',
} as const;

// ============================================
// PLACEHOLDERS
// ============================================

export const PLACEHOLDERS = {
  // Search
  SEARCH_MATCHES: 'Search matches...',
  SEARCH_USERS: 'Search users...',
  SEARCH_COMMUNITIES: 'Search communities...',

  // Forms
  ENTER_EMAIL: 'Enter your email',
  ENTER_PASSWORD: 'Enter your password',
  ENTER_USERNAME: 'Enter your username',
  ENTER_TITLE: 'Enter a title',
  ENTER_DESCRIPTION: 'Enter a description',
  ENTER_LOCATION: 'Enter location (optional)',
  ENTER_ROOM_CODE: 'Enter room code',

  // Content creation
  WHATS_ON_YOUR_MIND: "What's on your mind?",
  WRITE_COMMENT: 'Write a comment...',
  ADD_REPLY: 'Add a reply...',
  SHARE_THOUGHTS: 'Share your thoughts...',

  // Profile
  ADD_BIO: 'Add a bio...',
  YOUR_NICKNAME: 'Your nickname',
  YOUR_SCHOOL: 'Your school or organization',

  // Match creation
  MATCH_TITLE: 'Match title',
  MATCH_DESCRIPTION: 'Match description (optional)',
  INVITE_MESSAGE: 'Add a message to your invite...',
} as const;

// ============================================
// BUTTON LABELS
// ============================================

export const BUTTON_LABELS = {
  // Primary actions
  CREATE_MATCH: 'Create Match',
  JOIN_MATCH: 'Join Match',
  START_MATCH: 'Start Match',
  END_MATCH: 'End Match',
  LEAVE_MATCH: 'Leave Match',

  // Social actions
  CREATE_POST: 'Create Post',
  ADD_COMMENT: 'Add Comment',
  SEND_MESSAGE: 'Send Message',
  ADD_FRIEND: 'Add Friend',
  ACCEPT_REQUEST: 'Accept',
  DECLINE_REQUEST: 'Decline',
  BLOCK_USER: 'Block User',
  UNBLOCK_USER: 'Unblock User',

  // Community actions
  JOIN_COMMUNITY: 'Join Community',
  LEAVE_COMMUNITY: 'Leave Community',
  CREATE_COMMUNITY: 'Create Community',
  INVITE_MEMBERS: 'Invite Members',

  // Navigation
  VIEW_PROFILE: 'View Profile',
  VIEW_STATS: 'View Stats',
  VIEW_HISTORY: 'View History',
  VIEW_LEADERBOARD: 'View Leaderboard',
  MANAGE_SETTINGS: 'Manage Settings',

  // Media actions
  TAKE_PHOTO: 'Take Photo',
  CHOOSE_PHOTO: 'Choose Photo',
  UPLOAD_IMAGE: 'Upload Image',
  REMOVE_IMAGE: 'Remove Image',

  // Data actions
  EXPORT_DATA: 'Export Data',
  IMPORT_DATA: 'Import Data',
  SYNC_DATA: 'Sync Data',
  BACKUP_DATA: 'Backup Data',

  // Auth actions
  SIGN_IN: 'Sign In',
  SIGN_OUT: 'Sign Out',
  SIGN_UP: 'Sign Up',
  FORGOT_PASSWORD: 'Forgot Password?',
  RESET_PASSWORD: 'Reset Password',
  CHANGE_PASSWORD: 'Change Password',
  VERIFY_EMAIL: 'Verify Email',

  // Generic actions
  GET_STARTED: 'Get Started',
  LEARN_MORE: 'Learn More',
  TRY_AGAIN: 'Try Again',
  CONTACT_SUPPORT: 'Contact Support',
} as const;

// ============================================
// SCREEN TITLES
// ============================================

export const SCREEN_TITLES = {
  // Main tabs
  HOME: 'Home',
  SOCIAL: 'Social',
  PROFILE: 'Profile',

  // Auth screens
  LOGIN: 'Sign In',
  SIGNUP: 'Sign Up',
  FORGOT_PASSWORD: 'Reset Password',

  // Match screens
  CREATE_MATCH: 'Create Match',
  LIVE_MATCH: 'Live Match',
  MATCH_STATS: 'Match Statistics',
  MATCH_RECAP: 'Match Recap',
  MATCH_HISTORY: 'Match History',

  // Social screens
  COMMUNITIES: 'Communities',
  COMMUNITY_DETAILS: 'Community',
  COMMUNITY_MEMBERS: 'Members',
  COMMUNITY_SETTINGS: 'Community Settings',
  POST_DETAILS: 'Post',
  FRIENDS: 'Friends',
  FRIEND_REQUESTS: 'Friend Requests',

  // Analytics screens
  PLAYER_STATS: 'Player Statistics',
  TEAM_STATS: 'Team Statistics',
  LEADERBOARDS: 'Leaderboards',

  // Settings screens
  SETTINGS: 'Settings',
  APPEARANCE: 'Appearance',
  NOTIFICATIONS: 'Notifications',
  PRIVACY: 'Privacy & Security',
  ACCOUNT: 'Account',
  HELP_SUPPORT: 'Help & Support',
} as const;

// ============================================
// ACCESSIBILITY LABELS
// ============================================

export const A11Y_LABELS = {
  // Navigation
  TAB_HOME: 'Home tab',
  TAB_SOCIAL: 'Social tab',
  TAB_PROFILE: 'Profile tab',
  BACK_BUTTON: 'Go back',
  CLOSE_BUTTON: 'Close',
  MENU_BUTTON: 'Open menu',

  // Actions
  CREATE_BUTTON: 'Create new content',
  SEARCH_BUTTON: 'Search',
  FILTER_BUTTON: 'Filter options',
  SORT_BUTTON: 'Sort options',
  REFRESH_BUTTON: 'Refresh content',
  SHARE_BUTTON: 'Share',

  // Content
  MATCH_CARD: 'Match information',
  POST_CARD: 'Post content',
  USER_AVATAR: 'User profile picture',
  LOADING_INDICATOR: 'Loading content',

  // Forms
  EMAIL_INPUT: 'Email address input field',
  PASSWORD_INPUT: 'Password input field',
  SEARCH_INPUT: 'Search input field',

  // States
  SELECTED: 'Selected',
  UNSELECTED: 'Not selected',
  EXPANDED: 'Expanded',
  COLLAPSED: 'Collapsed',
  LOADING: 'Loading',
  ERROR: 'Error occurred',
} as const;

// ============================================
// EXPORT ALL MESSAGES
// ============================================

export const MESSAGES = {
  GENERAL,
  CREATION_MODAL,
  ERROR_MESSAGES,
  VALIDATION_MESSAGES,
  EMPTY_STATES,
  SUCCESS_MESSAGES,
  CONFIRMATION_MESSAGES,
  NOTIFICATION_MESSAGES,
  PLACEHOLDERS,
  BUTTON_LABELS,
  SCREEN_TITLES,
  A11Y_LABELS,
} as const;

// Export default for convenience
export default MESSAGES;
