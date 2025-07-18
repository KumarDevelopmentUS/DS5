// components/ui/QRCodeDisplay.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { QRCodeDisplayProps } from '../../types/tracker';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * QR Code Display Component
 *
 * Renders a QR code using react-native-qrcode-svg library
 * Supports theming and customization
 */
export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 150,
  backgroundColor,
  color,
  style,
  testID = 'qr-code-display',
}) => {
  const { colors } = useTheme();

  // Use theme colors as defaults
  const qrBackgroundColor = backgroundColor || colors.background;
  const qrColor = color || colors.text;

  if (!value) {
    return null;
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      <QRCode
        value={value}
        size={size}
        backgroundColor={qrBackgroundColor}
        color={qrColor}
        logoSize={size * 0.2}
        logoBackgroundColor={qrBackgroundColor}
        logoBorderRadius={size * 0.1}
        quietZone={10}
        enableLinearGradient={false}
        ecl="M" // Error correction level
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QRCodeDisplay;
