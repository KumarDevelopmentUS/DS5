// components/social/Community/index.ts

// Export all components
export { CommunityCard } from './CommunityCard';
export { CommunityHeader } from './CommunityHeader';
export { MemberList } from './MemberList';
export { CommunityGrid } from './CommunityGrid';

// Export styles
export { styles as CommunityCardStyles } from './CommunityCard.styles';
export { styles as CommunityHeaderStyles } from './CommunityHeader.styles';
export { styles as MemberListStyles } from './MemberList.styles';
export { styles as CommunityGridStyles } from './CommunityGrid.styles';

// Export types
export type {
  CommunityCardProps,
  CommunityCardVariant,
  CommunityHeaderProps,
  MemberListProps,
  MemberItemProps,
  CommunityGridProps,
} from './Community.types';

// Default exports for convenience
export { CommunityCard as default } from './CommunityCard';
