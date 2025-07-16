import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatCardProps } from './Stats.types';
import { TrendIndicator } from '@/components/match/Stats/TrendIndicator';
import { Card } from '../../core/Card';
import { useTheme } from '../../../hooks/ui/useTheme';
import { SPACING, TYPOGRAPHY, BORDERS } from '../../../constants/theme';

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color,
  size = 'medium',
  onPress,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const themeColor = color || colors.primary;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: SPACING.sm,
          titleSize: TYPOGRAPHY.sizes.caption1,
          valueSize: TYPOGRAPHY.sizes.headline,
          iconSize: 16,
        };
      case 'large':
        return {
          padding: SPACING.lg,
          titleSize: TYPOGRAPHY.sizes.body,
          valueSize: TYPOGRAPHY.sizes.title1,
          iconSize: 28,
        };
      default:
        return {
          padding: SPACING.md,
          titleSize: TYPOGRAPHY.sizes.footnote,
          valueSize: TYPOGRAPHY.sizes.title2,
          iconSize: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const cardStyle = StyleSheet.flatten([
    { padding: sizeStyles.padding },
    style,
  ]);

  const renderContent = () => (
    <>
      <View style={styles.header}>
        {icon && (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${themeColor}20` },
            ]}
          >
            {typeof icon === 'string' ? (
              <Ionicons
                name={icon as any}
                size={sizeStyles.iconSize}
                color={themeColor}
              />
            ) : (
              icon
            )}
          </View>
        )}
        <Text
          style={[
            styles.title,
            { fontSize: sizeStyles.titleSize, color: colors.textSecondary },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      <Text
        style={[
          styles.value,
          { fontSize: sizeStyles.valueSize, color: colors.text },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>

      {(subtitle || trend) && (
        <View style={styles.footer}>
          {subtitle && (
            <Text
              style={[styles.subtitle, { color: colors.textTertiary }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
          {trend && (
            <TrendIndicator
              trend={trend}
              value={trendValue}
              size="small"
              style={styles.trend}
            />
          )}
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <Card
        variant="default"
        pressable
        onPress={onPress}
        style={cardStyle}
        testID={testID}
      >
        {renderContent()}
      </Card>
    );
  }

  return (
    <Card variant="default" style={cardStyle} testID={testID}>
      {renderContent()}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDERS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    flex: 1,
  },
  value: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    flex: 1,
  },
  trend: {
    marginLeft: SPACING.xs,
  },
});
