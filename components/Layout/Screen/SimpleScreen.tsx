// components/Layout/Screen/SimpleScreen.tsx - DEBUG VERSION
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/ui/useTheme';

interface SimpleScreenProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  showHeader?: boolean;
  testID?: string;
}

export const SimpleScreen: React.FC<SimpleScreenProps> = ({
  children,
  title,
  subtitle,
  style,
  contentStyle,
  backgroundColor,
  showHeader = true,
  testID,
}) => {
  console.log('SimpleScreen props:', { title, subtitle, showHeader, testID });
  console.log('SimpleScreen children type:', typeof children);

  // Deep inspection of children
  if (Array.isArray(children)) {
    console.log('SimpleScreen children array length:', children.length);
    children.forEach((child, index) => {
      console.log(`Child ${index}:`, {
        type: typeof child,
        isString: typeof child === 'string',
        value: typeof child === 'string' ? child : 'not a string',
      });
    });
  } else {
    console.log('SimpleScreen single child:', {
      type: typeof children,
      isString: typeof children === 'string',
      value: typeof children === 'string' ? children : 'not a string',
    });
  }

  // Add safety check for children
  if (typeof children === 'string') {
    console.error(
      'WARNING: String passed as children to SimpleScreen:',
      children
    );
    return (
      <SafeAreaView style={[styles.container]} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Text style={{ color: 'red' }}>
            Error: String passed as children: "{children}"
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if children array contains strings
  if (Array.isArray(children)) {
    const stringChildren = children.filter(
      (child) => typeof child === 'string'
    );
    if (stringChildren.length > 0) {
      console.error('WARNING: String children found in array:', stringChildren);
      return (
        <SafeAreaView style={[styles.container]} edges={['top', 'bottom']}>
          <View style={styles.content}>
            <Text style={{ color: 'red' }}>
              Error: String children in array: {JSON.stringify(stringChildren)}
            </Text>
          </View>
        </SafeAreaView>
      );
    }
  }

  const { colors } = useTheme();
  const screenBackgroundColor = backgroundColor || colors.background;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: screenBackgroundColor },
        style,
      ]}
      edges={['top', 'bottom']}
      testID={testID}
    >
      {showHeader && (title || subtitle) && (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          {title && (
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.content,
          { backgroundColor: screenBackgroundColor },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default SimpleScreen;
