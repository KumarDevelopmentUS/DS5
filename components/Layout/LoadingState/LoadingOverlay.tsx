// components/layout/LoadingStates/LoadingOverlay.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Modal } from 'react-native';
import { LoadingOverlayProps } from './LoadingStates.types';
import { styles } from './LoadingStates.styles';
import { useTheme } from '../../../contexts/ThemeContext';
import { Spinner } from './Spinner';

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  spinner = true,
  backgroundColor,
  opacity = 0.5,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  const overlayBackgroundColor = backgroundColor || `rgba(0, 0, 0, ${opacity})`;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      testID={testID}
    >
      <Animated.View
        style={[
          styles.loadingOverlay,
          { backgroundColor: overlayBackgroundColor, opacity: fadeAnim },
          style,
        ]}
      >
        <View
          style={[
            styles.loadingOverlayContent,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.text,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 8,
            },
          ]}
        >
          {spinner && <Spinner size="large" variant="primary" />}

          {message && (
            <Text
              style={[styles.loadingOverlayMessage, { color: colors.text }]}
            >
              {message}
            </Text>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

// Specialized loading overlays for common scenarios
export const SavingOverlay: React.FC<{
  visible: boolean;
  testID?: string;
}> = ({ visible, testID }) => (
  <LoadingOverlay visible={visible} message="Saving..." testID={testID} />
);

export const SubmittingOverlay: React.FC<{
  visible: boolean;
  testID?: string;
}> = ({ visible, testID }) => (
  <LoadingOverlay visible={visible} message="Submitting..." testID={testID} />
);

export const ProcessingOverlay: React.FC<{
  visible: boolean;
  message?: string;
  testID?: string;
}> = ({ visible, message = 'Processing...', testID }) => (
  <LoadingOverlay visible={visible} message={message} testID={testID} />
);

export const UploadingOverlay: React.FC<{
  visible: boolean;
  progress?: number;
  testID?: string;
}> = ({ visible, progress, testID }) => (
  <LoadingOverlay
    visible={visible}
    message={
      progress !== undefined
        ? `Uploading... ${Math.round(progress * 100)}%`
        : 'Uploading...'
    }
    testID={testID}
  />
);
