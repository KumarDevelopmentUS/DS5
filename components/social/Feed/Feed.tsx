// components/social/Feed/Feed.tsx
import React, { useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { FeedProps } from './Feed.types';
import { FeedItem } from './FeedItem';
import { EmptyState } from '../../Layout/LoadingStates';
import { useTheme } from '../../../hooks/ui/useTheme';
import { FeedItem as FeedItemType } from '../../../hooks/social/useCombinedFeed';

export const Feed: React.FC<FeedProps> = ({
  items,
  loading = false,
  loadingMore = false,
  hasNextPage = false,
  onLoadMore,
  onRefresh,
  onItemPress,
  emptyMessage = 'No posts yet',
  style,
  contentContainerStyle,
}) => {
  const { colors } = useTheme();

  // Handle reaching end of list
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasNextPage, loadingMore, onLoadMore]);

  // Render individual feed item
  const renderItem = useCallback(
    ({ item }: { item: FeedItemType }) => (
      <FeedItem item={item} onPress={onItemPress} />
    ),
    [onItemPress]
  );

  // Key extractor
  const keyExtractor = useCallback((item: FeedItemType) => item.id, []);

  // Render footer (loading more indicator)
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }, [loadingMore, colors.primary]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    return <EmptyState message={emptyMessage} />;
  }, [loading, emptyMessage, colors.primary]);

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={[
        styles.contentContainer,
        items.length === 0 && styles.emptyContainer,
        contentContainerStyle,
      ]}
      style={[styles.container, { backgroundColor: colors.background }, style]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={loading && items.length > 0}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  separator: {
    height: 8,
  },
});
