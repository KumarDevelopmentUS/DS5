// components/core/ProgressIndicator/ProgressIndicator.tsx
import React from 'react';
import { View, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import { ProgressIndicatorProps } from './ProgressIndicator.types';
import { styles } from './ProgressIndicator.styles';
import { useTheme } from '../../../contexts/ThemeContext';

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
  variant = 'dots',
  size = 'medium',
  allowNavigation = false,
  onStepPress,
  showLabels = false,
  showProgress = true,
  style,
  testID,
}) => {
  const { colors } = useTheme();

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  // Get step state
  const getStepState = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  // Get step colors based on state
  const getStepColors = (stepIndex: number) => {
    const state = getStepState(stepIndex);

    switch (state) {
      case 'completed':
        return {
          background: colors.success,
          border: colors.success,
          text: '#FFFFFF',
        };
      case 'current':
        return {
          background: colors.primary,
          border: colors.primary,
          text: '#FFFFFF',
        };
      case 'upcoming':
      default:
        return {
          background: 'transparent',
          border: colors.border,
          text: colors.textSecondary,
        };
    }
  };

  // Handle step press
  const handleStepPress = (stepIndex: number) => {
    if (!allowNavigation || !onStepPress) return;

    // Only allow navigation to completed steps or current step
    if (stepIndex <= currentStep) {
      onStepPress(stepIndex);
    }
  };

  // Render progress text
  const renderProgressText = () => {
    if (!showProgress) return null;

    return (
      <Text
        style={[styles.progressText, { color: colors.textSecondary }]}
        testID={`${testID}-progress-text`}
      >
        Step {currentStep + 1} of {totalSteps}
      </Text>
    );
  };

  // Render dots variant
  const renderDots = () => {
    // Type-safe access to dot size styles
    const dotSizeStyleMap = {
      small: styles.dotSmall,
      medium: styles.dotMedium,
      large: styles.dotLarge,
    };

    const dotSizeStyle = dotSizeStyleMap[size];

    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepColors = getStepColors(index);
          const isClickable =
            allowNavigation && index <= currentStep && onStepPress;

          // Create dynamic styles
          const dynamicDotStyles: ViewStyle = {
            backgroundColor: stepColors.background,
            borderColor: stepColors.border,
            borderWidth: stepColors.background === 'transparent' ? 1 : 0,
          };

          // Add opacity for clickable items
          if (isClickable) {
            dynamicDotStyles.opacity = 0.8;
          }

          const combinedStyles: ViewStyle[] = [
            styles.dot,
            dotSizeStyle,
            dynamicDotStyles,
          ];

          if (isClickable) {
            return (
              <Pressable
                key={index}
                style={combinedStyles}
                onPress={() => handleStepPress(index)}
                testID={`${testID}-dot-${index}`}
              />
            );
          }

          return (
            <View
              key={index}
              style={combinedStyles}
              testID={`${testID}-dot-${index}`}
            />
          );
        })}
      </View>
    );
  };

  // Render steps variant
  const renderSteps = () => {
    // Type-safe access to step size styles
    const stepSizeStyleMap = {
      small: styles.stepSmall,
      medium: styles.stepMedium,
      large: styles.stepLarge,
    };

    const numberSizeStyleMap = {
      small: styles.stepNumberSmall,
      medium: styles.stepNumberMedium,
      large: styles.stepNumberLarge,
    };

    const stepSizeStyle = stepSizeStyleMap[size];
    const numberSizeStyle = numberSizeStyleMap[size];

    return (
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepColors = getStepColors(index);
          const isClickable =
            allowNavigation && index <= currentStep && onStepPress;
          const step = steps?.[index];
          const state = getStepState(index);

          // Get step height for connector positioning
          const stepHeight = stepSizeStyle?.height || 32;

          // Create dynamic styles for step circle
          const dynamicStepStyles: ViewStyle = {
            backgroundColor: stepColors.background,
            borderColor: stepColors.border,
          };

          const stepCircleStyles: ViewStyle[] = [
            styles.stepCircle,
            stepSizeStyle,
            dynamicStepStyles,
          ];

          // Create dynamic text styles
          const stepNumberTextStyle: TextStyle = {
            color: stepColors.text,
          };

          const stepTitleTextStyle: TextStyle = {
            color: stepColors.text,
          };

          const stepDescriptionTextStyle: TextStyle = {
            color: colors.textTertiary,
          };

          return (
            <React.Fragment key={index}>
              <View style={styles.stepWrapper}>
                {isClickable ? (
                  <Pressable
                    style={stepCircleStyles}
                    onPress={() => handleStepPress(index)}
                    testID={`${testID}-step-${index}`}
                  >
                    <Text
                      style={[
                        styles.stepNumber,
                        numberSizeStyle,
                        stepNumberTextStyle,
                      ]}
                    >
                      {state === 'completed' ? '✓' : index + 1}
                    </Text>
                  </Pressable>
                ) : (
                  <View
                    style={stepCircleStyles}
                    testID={`${testID}-step-${index}`}
                  >
                    <Text
                      style={[
                        styles.stepNumber,
                        numberSizeStyle,
                        stepNumberTextStyle,
                      ]}
                    >
                      {state === 'completed' ? '✓' : index + 1}
                    </Text>
                  </View>
                )}

                {showLabels && step && (
                  <View style={styles.stepContent}>
                    {step.title && (
                      <Text
                        style={[styles.stepTitle, stepTitleTextStyle]}
                        testID={`${testID}-step-title-${index}`}
                      >
                        {step.title}
                      </Text>
                    )}
                    {step.description && (
                      <Text
                        style={[
                          styles.stepDescription,
                          stepDescriptionTextStyle,
                        ]}
                        testID={`${testID}-step-description-${index}`}
                      >
                        {step.description}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Connector line */}
              {index < totalSteps - 1 && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor:
                        index < currentStep ? colors.success : colors.border,
                      marginTop: stepHeight / 2,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  // Render bar variant
  const renderBar = () => {
    // Type-safe access to bar size styles
    const barSizeStyleMap = {
      small: styles.barSmall,
      medium: styles.barMedium,
      large: styles.barLarge,
    };

    const barSizeStyle = barSizeStyleMap[size];

    const containerStyles: ViewStyle[] = [
      styles.barContainer,
      barSizeStyle,
      { backgroundColor: colors.fill },
    ];

    return (
      <View style={containerStyles}>
        <View
          style={[
            styles.barFill,
            {
              width: `${progressPercentage}%`,
              backgroundColor: colors.primary,
            },
          ]}
          testID={`${testID}-bar-fill`}
        />
      </View>
    );
  };

  // Render progress indicator based on variant
  const renderProgressIndicator = () => {
    switch (variant) {
      case 'steps':
        return renderSteps();
      case 'bar':
        return renderBar();
      case 'dots':
      default:
        return renderDots();
    }
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {renderProgressText()}
      {renderProgressIndicator()}
    </View>
  );
};
