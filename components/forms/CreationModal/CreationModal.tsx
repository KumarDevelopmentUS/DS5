// components/forms/CreationModal/CreationModal.tsx
import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CreationModalProps, CreationOption } from './CreationModal.types';
import { styles } from './CreationModal.styles';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/auth/useAuth';
import { usePermissions } from '../../../hooks/auth/usePermissions';
import { Modal } from '../../core/Modal';
import { MESSAGES } from '../../../constants/messages';
import {
  MATCH_ROUTES,
  SOCIAL_ROUTES,
  ANALYTICS_ROUTES,
} from '../../../constants/routes';
import * as permissionUtils from '../../../utils/permissions';

// Default creation options configuration
const DEFAULT_OPTIONS: CreationOption[] = [
  {
    id: 'match',
    title: MESSAGES.CREATION_MODAL.OPTIONS.MATCH.TITLE,
    description: MESSAGES.CREATION_MODAL.OPTIONS.MATCH.DESCRIPTION,
    iconName: MESSAGES.CREATION_MODAL.OPTIONS.MATCH.ICON_NAME,
    route: MATCH_ROUTES.create(),
    requiresAuth: false, // Allow guests to create matches
    requiresPermission: false,
  },
  {
    id: 'post',
    title: MESSAGES.CREATION_MODAL.OPTIONS.POST.TITLE,
    description: MESSAGES.CREATION_MODAL.OPTIONS.POST.DESCRIPTION,
    iconName: MESSAGES.CREATION_MODAL.OPTIONS.POST.ICON_NAME,
    route: '/social/post/create', // This would be a create post route
    requiresAuth: true,
    requiresPermission: false,
  },
  {
    id: 'community',
    title: MESSAGES.CREATION_MODAL.OPTIONS.COMMUNITY.TITLE,
    description: MESSAGES.CREATION_MODAL.OPTIONS.COMMUNITY.DESCRIPTION,
    iconName: MESSAGES.CREATION_MODAL.OPTIONS.COMMUNITY.ICON_NAME,
    route: '/social/community/create', // This would be a create community route
    requiresAuth: true,
    requiresPermission: true,
  },
  {
    id: 'tournament',
    title: MESSAGES.CREATION_MODAL.OPTIONS.TOURNAMENT.TITLE,
    description: MESSAGES.CREATION_MODAL.OPTIONS.TOURNAMENT.DESCRIPTION,
    iconName: MESSAGES.CREATION_MODAL.OPTIONS.TOURNAMENT.ICON_NAME,
    route: '/tournament/create', // Future tournament feature
    requiresAuth: true,
    requiresPermission: true,
    comingSoon: true,
  },
  {
    id: 'event',
    title: MESSAGES.CREATION_MODAL.OPTIONS.EVENT.TITLE,
    description: MESSAGES.CREATION_MODAL.OPTIONS.EVENT.DESCRIPTION,
    iconName: MESSAGES.CREATION_MODAL.OPTIONS.EVENT.ICON_NAME,
    route: '/event/create', // Future event feature
    requiresAuth: true,
    requiresPermission: false,
    comingSoon: true,
  },
];

export const CreationModal: React.FC<CreationModalProps> = ({
  visible,
  onClose,
  onOptionSelect,
  enabledOptions,
  disabledOptions,
  title = MESSAGES.CREATION_MODAL.TITLE,
  subtitle = MESSAGES.CREATION_MODAL.SUBTITLE,
  customOptions,
  style,
  testID = 'creation-modal',
}) => {
  const { colors } = useTheme();
  const { isAuthenticated, profile } = useAuth();
  const router = useRouter();

  // Filter and prepare options based on props and user permissions
  const availableOptions = useMemo(() => {
    const optionsToUse = customOptions || DEFAULT_OPTIONS;

    return optionsToUse.filter((option) => {
      // Filter by enabled/disabled lists
      if (enabledOptions && !enabledOptions.includes(option.id)) {
        return false;
      }
      if (disabledOptions && disabledOptions.includes(option.id)) {
        return false;
      }

      // Check authentication requirement
      if (option.requiresAuth && !isAuthenticated) {
        return false;
      }

      // Check specific permissions
      if (option.requiresPermission && profile) {
        // Cast profile to User type for permission utils
        // In a real app, you'd ensure UserProfile and User are compatible
        // or create adapter functions
        const userForPermissions = profile as any; // Temporary type assertion

        switch (option.id) {
          case 'community':
            return permissionUtils.canCreateCommunity(userForPermissions);
          case 'tournament':
            // Add tournament creation permission logic here
            return permissionUtils.isGlobalAdmin(userForPermissions);
          default:
            return true;
        }
      }

      return true;
    });
  }, [
    customOptions,
    enabledOptions,
    disabledOptions,
    isAuthenticated,
    profile,
  ]);

  // Handle option selection
  const handleOptionPress = (option: CreationOption) => {
    if (option.comingSoon) {
      Alert.alert(
        MESSAGES.GENERAL.INFO,
        `${option.title} is coming soon! Stay tuned for updates.`,
        [{ text: MESSAGES.GENERAL.DONE, style: 'default' }]
      );
      return;
    }

    // Show guest warning for match creation
    if (option.id === 'match' && !isAuthenticated) {
      Alert.alert(
        'Guest Mode',
        'You\'re creating a match as a guest. Your match data will not be saved to the database. Sign in to save your progress and access all features.',
        [
          { text: 'Continue as Guest', style: 'default' },
          { text: 'Sign In', style: 'default', onPress: () => {
            onClose();
            router.push('/(auth)/login');
          }},
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    if (option.requiresAuth && !isAuthenticated) {
      Alert.alert(
        MESSAGES.ERROR_MESSAGES.UNAUTHORIZED,
        'Please sign in to create content.',
        [
          { text: MESSAGES.GENERAL.CANCEL, style: 'cancel' },
          {
            text: MESSAGES.BUTTON_LABELS.SIGN_IN,
            onPress: () => {
              onClose();
              router.push('/(auth)/login');
            },
          },
        ]
      );
      return;
    }

    // Call custom handler if provided
    if (onOptionSelect) {
      onOptionSelect(option);
    } else {
      // Default behavior: navigate to the route
      onClose();
      router.push(option.route as any);
    }
  };

  // Render icon placeholder (you would use actual icons here)
  const renderIcon = (iconName: string) => {
    // This is a placeholder - you would use your actual icon library here
    const iconMap: Record<string, string> = {
      'play-circle': '▶️',
      edit: '✏️',
      users: '👥',
      trophy: '🏆',
      calendar: '📅',
    };

    return <Text style={{ fontSize: 24 }}>{iconMap[iconName] || '🎮'}</Text>;
  };

  // Render individual option card
  const renderOption = (option: CreationOption) => {
    const isDisabled = option.comingSoon && !option.requiresPermission;

    return (
      <Pressable
        key={option.id}
        style={({ pressed }) => [
          styles.optionCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          pressed && [
            styles.optionCardPressed,
            { backgroundColor: colors.fillSecondary },
          ],
          isDisabled && styles.optionCardDisabled,
        ]}
        onPress={() => handleOptionPress(option)}
        disabled={isDisabled}
        testID={`${testID}-option-${option.id}`}
        accessibilityRole="button"
        accessibilityLabel={`${option.title}. ${option.description}`}
        accessibilityHint={option.comingSoon ? 'Coming soon' : 'Tap to create'}
      >
        {/* Coming Soon Badge */}
        {option.comingSoon && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>
              {MESSAGES.EMPTY_STATES.COMING_SOON}
            </Text>
          </View>
        )}

        {/* Icon */}
        <View
          style={[
            styles.optionIconContainer,
            { backgroundColor: colors.fillTertiary },
          ]}
        >
          {renderIcon(option.iconName)}
        </View>

        {/* Content */}
        <View style={styles.optionContent}>
          <Text
            style={[styles.optionTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {option.title}
          </Text>
          <Text
            style={[styles.optionDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {option.description}
          </Text>
        </View>
      </Pressable>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
        {MESSAGES.GENERAL.LOADING}
      </Text>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {MESSAGES.EMPTY_STATES.NOTHING_HERE}
      </Text>
    </View>
  );

  // Render content
  const renderContent = () => {
    if (availableOptions.length === 0) {
      return renderEmpty();
    }

    return (
      <ScrollView
        style={styles.optionsContainer}
        contentContainerStyle={styles.optionsGrid}
        showsVerticalScrollIndicator={false}
        testID={`${testID}-options-list`}
      >
        {availableOptions.map(renderOption)}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      size="medium"
      position="center"
      padding="lg"
      closeOnBackdropPress={true}
      showCloseButton={true}
      animationType="scale"
      testID={testID}
      style={style}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text
            style={[styles.title, { color: colors.text }]}
            testID={`${testID}-title`}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, { color: colors.textSecondary }]}
              testID={`${testID}-subtitle`}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Content */}
        {renderContent()}
      </View>
    </Modal>
  );
};
