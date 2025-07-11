import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../../../hooks/ui/useTheme';
import { InputProps } from './Input.types';
import { createStyles } from './Input.styles';

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  ...textInputProps
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[styles.inputContainer, hasError && styles.inputContainerError]}
      >
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textSecondary}
          {...textInputProps}
        />
        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
