// components/social/Community/CommunityGrid.tsx
import React from 'react';
import { Dimensions, FlatList, RefreshControl, View } from 'react-native';
import { useTheme } from '../../../hooks/ui/useTheme';
import { Community } from '../../../types/models';
import { CommunityGridProps } from './Community.types';
import { CommunityCard } from './CommunityCard';
import { styles } from './CommunityGrid.styles';

const { width: screenWidth } = Dimensions.get('window');

export const CommunityGrid: React.FC<CommunityGridProps> = ({
  communities,
  loading = false,
  numColumns = 1,
  onCommunityPress,
  onJoinPress,
  onRefresh,
  refreshing = false,
  onLoadMore,
  hasMore = false,
  style,
  testID,
}) => {
  const { colors } = useTheme();

  const renderCommunity = ({
    item: community,
    index,
  }: {
    item: Community;
    index: number;
  }) => {
    const variant = numColumns > 1 ? 'compact' : 'default';

    return (
      <View style={[styles.gridItem, { width: getItemWidth() }]}>
        <CommunityCard
          community={community}
          variant={variant}
          showJoinButton={true}
          onPress={onCommunityPress}
          onJoinPress={onJoinPress}
          testID={`${testID}-community-${index}`}
        />
      </View>
    );
  };

  const getItemWidth = () => {
    if (numColumns === 1) return '100%';

    const totalSpacing = (numColumns - 1) * 16; // 16px gap between items
    const containerPadding = 32; // 16px padding on each side
    const availableWidth = screenWidth - containerPadding - totalSpacing;

    return availableWidth / numColumns;
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        {/* Empty state will be handled by parent component */}
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore || loading) return null;

    return (
      <View style={styles.footerContainer}>
        {/* Load more indicator - handled by parent component */}
      </View>
    );
  };

  const keyExtractor = (item: Community) => item.id;

  const getItemLayout = (_: any, index: number) => ({
    length: 120, // Estimated item height
    offset: 120 * index,
    index,
  });

  const handleEndReached = () => {
    if (hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <View
      style={
        style
          ? [styles.container, ...(Array.isArray(style) ? style : [style])]
          : styles.container
      }
      testID={testID}
    >
      <FlatList
        data={communities}
        renderItem={renderCommunity}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        key={numColumns} // Force re-render when columns change
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        getItemLayout={numColumns === 1 ? getItemLayout : undefined}
      />
    </View>
  );
};
