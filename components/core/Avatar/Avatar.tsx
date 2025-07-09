// components/core/Avatar/Avatar.tsx
import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { COMPONENT_SIZES, TYPOGRAPHY } from '../../../constants/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { styles } from './Avatar.styles';
import { AvatarProps } from './Avatar.types';

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name = '',
  size = 'medium',
  showStatus = false,
  status = 'offline',
  pressable = false,
  onPress,
  style,
  imageStyle,
  testID,
}) => {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Get initials from name
  const getInitials = (fullName: string): string => {
    if (!fullName.trim()) return '?';

    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Get font size based on avatar size
  const getFontSize = (): number => {
    const avatarSize = COMPONENT_SIZES.avatar[size];
    return Math.floor(avatarSize * 0.4); // 40% of avatar size
  };

  // Get status color
  const getStatusColor = (): string => {
    switch (status) {
      case 'online':
        return colors.success;
      case 'away':
        return colors.warning;
      case 'busy':
        return colors.error;
      case 'offline':
      default:
        return colors.textTertiary;
    }
  };

  // Get container styles
  const getContainerStyles = () => {
    const staticStyles = [styles.container, styles[size]];

    const dynamicStyles = {
      backgroundColor: colors.fill,
      borderColor: colors.border,
      borderWidth: 1,
    };

    return [...staticStyles, dynamicStyles, style];
  };

  // Get image styles
  const getImageStyles = () => {
    return [styles.image, imageStyle];
  };

  // Get status indicator styles
  const getStatusIndicatorStyles = () => {
    const statusSize =
      `status${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles;

    return [
      styles.statusIndicator,
      styles[statusSize],
      {
        backgroundColor: getStatusColor(),
        borderColor: colors.background,
      },
    ];
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageError(false);
    setImageLoading(false);
  };

  // Render avatar content
  const renderAvatarContent = () => {
    // Show initials if no source, image error, or still loading
    if (!source || imageError || imageLoading) {
      return (
        <View style={styles.initials}>
          <Text
            style={{
              color: colors.text,
              fontSize: getFontSize(),
              fontFamily: TYPOGRAPHY.fontFamily.medium,
              includeFontPadding: false,
            }}
            testID={`${testID}-initials`}
          >
            {getInitials(name)}
          </Text>
        </View>
      );
    }

    // Show image
    return (
      <Image
        source={{ uri: source }}
        style={getImageStyles()}
        onError={handleImageError}
        onLoad={handleImageLoad}
        onLoadStart={() => setImageLoading(true)}
        testID={`${testID}-image`}
        defaultSource={require('../../../assets/images/placeholders/avatar-default.png')}
      />
    );
  };

  // Render status indicator
  const renderStatusIndicator = () => {
    if (!showStatus) return null;

    return (
      <View style={styles.statusContainer}>
        <View style={getStatusIndicatorStyles()} testID={`${testID}-status`} />
      </View>
    );
  };

  // Render avatar
  const renderAvatar = () => (
    <View style={getContainerStyles()}>
      {renderAvatarContent()}
      {renderStatusIndicator()}
    </View>
  );

  // If pressable, wrap in Pressable
  if (pressable && onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          pressed && {
            opacity: colors.activeOpacity,
            transform: [{ scale: 0.95 }],
          },
        ]}
        testID={testID}
      >
        {renderAvatar()}
      </Pressable>
    );
  }

  // Otherwise, render as View
  return <View testID={testID}>{renderAvatar()}</View>;
};
