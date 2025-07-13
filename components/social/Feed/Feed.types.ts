// components/social/Feed/Feed.types.ts
import { FeedItem as FeedItemType } from '../../../hooks/social/useCombinedFeed';
import { ViewStyle, StyleProp } from 'react-native';

export interface FeedProps {
  items: FeedItemType[];
  loading?: boolean;
  loadingMore?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onItemPress?: (item: FeedItemType) => void;
  emptyMessage?: string;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export interface FeedItemProps {
  item: FeedItemType;
  onPress?: (item: FeedItemType) => void;
}
