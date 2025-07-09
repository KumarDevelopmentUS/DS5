// components/layout/Screen/Screen.tsx
import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenProps } from './Screen.types';
import { ScreenHeader } from './ScreenHeader';
import { styles } from './Screen.styles';
import { useTheme } from '../../../contexts/ThemeContext';

export const Screen: React.FC<ScreenProps> = ({
  children,
  header,
  preset = 'fixed',
  safeAreaEdges = ['top', 'bottom'],
  style,
  contentContainerStyle,
  backgroundColor,
  scrollViewProps,
  keyboardShouldPersistTaps = 'handled',
  testID,
}) => {
  const { colors } = useTheme();

  const screenBackgroundColor = backgroundColor || colors.background;

  const containerStyle: StyleProp<ViewStyle> = [
    styles.screenContainer,
    { backgroundColor: screenBackgroundColor },
    style,
  ];

  const renderHeader = () => {
    if (header === null) return null;
    if (!header) return null;

    return <ScreenHeader {...header} />;
  };

  const renderContent = () => {
    const baseContentStyle: StyleProp<ViewStyle> = {
      backgroundColor: screenBackgroundColor,
    };

    switch (preset) {
      case 'scroll':
        return (
          <ScrollView
            style={[baseContentStyle]}
            contentContainerStyle={[
              styles.scrollContent,
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            showsVerticalScrollIndicator={false}
            {...scrollViewProps}
          >
            {children}
          </ScrollView>
        );

      case 'auto':
        return (
          <View
            style={[
              styles.autoContent,
              baseContentStyle,
              contentContainerStyle,
            ]}
          >
            {children}
          </View>
        );

      case 'fixed':
      default:
        return (
          <View
            style={[
              styles.fixedContent,
              baseContentStyle,
              contentContainerStyle,
            ]}
          >
            {children}
          </View>
        );
    }
  };

  const ScreenComponent = () => (
    <View style={containerStyle} testID={testID}>
      {renderHeader()}
      {renderContent()}
    </View>
  );

  // Handle keyboard avoidance on iOS
  if (Platform.OS === 'ios') {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: screenBackgroundColor }}
        edges={safeAreaEdges}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={0}
        >
          <ScreenComponent />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Android and other platforms
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: screenBackgroundColor }}
      edges={safeAreaEdges}
    >
      <ScreenComponent />
    </SafeAreaView>
  );
};
