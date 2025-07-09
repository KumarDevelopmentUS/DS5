// components/core/Modal/Modal.tsx
import React, { useEffect, useRef } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  Pressable,
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ModalProps } from './Modal.types';
import { styles } from './Modal.styles';
import { useTheme } from '../../../contexts/ThemeContext';
import { ANIMATIONS, TYPOGRAPHY, SPACING } from '../../../constants/theme';

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  title,
  size = 'medium',
  position = 'center',
  padding = 'lg',
  dismissible = true,
  closeOnBackdropPress = true,
  showCloseButton = true,
  animationType = 'fade',
  animationDuration = 'normal',
  style,
  contentStyle,
  testID,
  ...modalProps
}) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;

  // Get animation duration as number
  const getDuration = () => {
    const duration = ANIMATIONS[animationDuration];
    return typeof duration === 'number' ? duration : ANIMATIONS.normal;
  };

  // Handle animation
  useEffect(() => {
    const duration = getDuration();

    if (visible) {
      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, animatedValue, scaleValue, animationDuration]);

  // Handle back button on Android
  useEffect(() => {
    if (!visible || !dismissible) return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onClose();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [visible, dismissible, onClose]);

  // Get container styles
  const getContainerStyles = () => {
    const staticStyles = [
      styles.container,
      styles[size],
      position !== 'center' && styles[position],
    ];

    const dynamicStyles = {
      backgroundColor: colors.background,
      shadowColor: colors.text,
      ...styles.container,
    };

    return [...staticStyles, dynamicStyles, style];
  };

  // Get content styles
  const getContentStyles = () => {
    const staticStyles = [styles.content];

    // Create dynamic padding if specified
    const dynamicStyles: any = {};
    if (padding) {
      dynamicStyles.padding = SPACING[padding];
    }

    return [...staticStyles, dynamicStyles, contentStyle];
  };

  // Animation transform based on type and position
  const getAnimationTransform = () => {
    const baseTransform = [];

    if (animationType === 'scale') {
      baseTransform.push({ scale: scaleValue });
    }

    if (animationType === 'slide') {
      if (position === 'bottom') {
        baseTransform.push({
          translateY: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [300, 0],
          }),
        });
      } else if (position === 'top') {
        baseTransform.push({
          translateY: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-300, 0],
          }),
        });
      }
    }

    return baseTransform;
  };

  // Render close button
  const renderCloseButton = () => {
    if (!showCloseButton) return null;

    return (
      <Pressable
        style={[styles.closeButton, { backgroundColor: colors.fillSecondary }]}
        onPress={onClose}
        testID={`${testID}-close-button`}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 18 }}>×</Text>
      </Pressable>
    );
  };

  // Render header
  const renderHeader = () => {
    if (!title && !showCloseButton) return null;

    return (
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {/* Placeholder for symmetry */}
        <View style={{ width: 32 }} />

        {title && (
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: TYPOGRAPHY.sizes.headline,
                fontFamily: TYPOGRAPHY.fontFamily.medium,
              },
            ]}
            testID={`${testID}-title`}
          >
            {title}
          </Text>
        )}

        {renderCloseButton()}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <RNModal
      transparent
      visible={visible}
      animationType="none" // We handle animations ourselves
      statusBarTranslucent
      testID={testID}
      {...modalProps}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: animatedValue,
            },
          ]}
        >
          {/* Backdrop */}
          <Pressable
            style={[styles.backdrop, { backgroundColor: colors.overlay }]}
            onPress={closeOnBackdropPress ? onClose : undefined}
            testID={`${testID}-backdrop`}
          />

          {/* Modal Content */}
          <Animated.View
            style={[
              getContainerStyles(),
              {
                transform: getAnimationTransform(),
                opacity: animationType === 'fade' ? animatedValue : 1,
              },
            ]}
          >
            {renderHeader()}
            <View style={getContentStyles()}>{children}</View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};
