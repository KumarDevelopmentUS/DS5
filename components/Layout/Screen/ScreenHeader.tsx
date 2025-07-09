// components/layout/Screen/ScreenHeader.tsx
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenHeaderProps, ScreenHeaderAction } from './Screen.types';
import { styles } from './Screen.styles';
import { useTheme } from '../../../contexts/ThemeContext';

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  backButtonTestID,
  rightActions = [],
  leftActions = [],
  headerStyle,
  titleStyle,
  subtitleStyle,
  testID,
}) => {
  const { colors } = useTheme();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const renderBackButton = () => {
    if (!showBackButton) return null;

    return (
      <Pressable
        style={[styles.backButton, { backgroundColor: 'transparent' }]}
        onPress={handleBackPress}
        testID={backButtonTestID || `${testID}-back-button`}
      >
        {/* You can replace this with an actual icon component */}
        <Text style={{ color: colors.primary, fontSize: 18 }}>←</Text>
      </Pressable>
    );
  };

  const renderAction = (action: ScreenHeaderAction) => {
    const actionStyle: StyleProp<ViewStyle> = [
      styles.headerAction,
      action.disabled && styles.disabled,
    ];

    return (
      <Pressable
        key={action.id}
        style={actionStyle}
        onPress={action.onPress}
        disabled={action.disabled}
        testID={action.testID}
      >
        {action.icon && action.icon}
        {action.text && (
          <Text
            style={[
              styles.headerActionText,
              {
                color: action.disabled ? colors.textSecondary : colors.primary,
              },
            ]}
          >
            {action.text}
          </Text>
        )}
      </Pressable>
    );
  };

  const renderLeftSide = () => {
    const hasBackButton = showBackButton;
    const hasLeftActions = leftActions.length > 0;

    if (!hasBackButton && !hasLeftActions) {
      return <View style={styles.headerSide} />;
    }

    return (
      <View style={styles.headerSide}>
        {renderBackButton()}
        {leftActions.map(renderAction)}
      </View>
    );
  };

  const renderRightSide = () => {
    if (rightActions.length === 0) {
      return <View style={styles.headerSide} />;
    }

    return (
      <View style={styles.headerSide}>{rightActions.map(renderAction)}</View>
    );
  };

  const renderTitle = () => {
    if (!title && !subtitle) return null;

    return (
      <View style={styles.headerContent}>
        {title && (
          <Text
            style={[styles.headerTitle, { color: colors.text }, titleStyle]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            style={[
              styles.headerSubtitle,
              { color: colors.textSecondary },
              subtitleStyle,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
        headerStyle,
      ]}
      testID={testID}
    >
      {renderLeftSide()}
      {renderTitle()}
      {renderRightSide()}
    </View>
  );
};
