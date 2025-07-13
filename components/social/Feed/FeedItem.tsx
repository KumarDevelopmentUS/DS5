// components/social/Feed/FeedItem.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { FeedItemProps } from './Feed.types';
import { PostFeedItem } from './PostFeedItem';
import { MatchFeedItem } from './MatchFeedItem';
import { ActivityFeedItem } from './ActivityFeedItem';
import { Card } from '../../core/Card';
import { SPACING } from '../../../constants/theme';

export const FeedItem: React.FC<FeedItemProps> = ({ item, onPress }) => {
  const handlePress = () => {
    onPress?.(item);
  };

  const renderContent = () => {
    switch (item.type) {
      case 'post':
        return <PostFeedItem item={item} />;
      case 'match_result':
        return <MatchFeedItem item={item} />;
      case 'friend_activity':
        return <ActivityFeedItem item={item} />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Card style={styles.card}>{renderContent()}</Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
  },
  card: {
    padding: SPACING.md,
  },
});
