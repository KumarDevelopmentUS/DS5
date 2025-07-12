// components/forms/SchoolPicker/SchoolPicker.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { SchoolPickerProps } from './SchoolPicker.types';
import { createStyles } from './SchoolPicker.styles';
import { useTheme } from '../../../hooks/ui/useTheme';
import { SCHOOLS, School } from '../../../constants/data/schools';
import { Button } from '../../core/Button';

const ChevronDownIcon = () => (
  <Text style={{ fontSize: 16, color: '#999' }}>▼</Text>
);

export const SchoolPicker: React.FC<SchoolPickerProps> = ({
  value,
  onSelect,
  label,
  placeholder = 'Select a school...',
  error,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchools = useMemo(() => {
    if (!searchQuery) {
      return SCHOOLS;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return SCHOOLS.filter(
      (school) =>
        school.name.toLowerCase().includes(lowercasedQuery) ||
        school.state.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery]);

  const handleSelectSchool = (school: School) => {
    onSelect(school);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleClearSelection = () => {
    onSelect(null);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSearchQuery('');
  };

  const renderItem = ({ item }: { item: School }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleSelectSchool(item)}
      activeOpacity={0.7}
    >
      <View>
        <Text style={styles.listItemText}>{item.name}</Text>
        <Text
          style={[
            styles.listItemText,
            { fontSize: 14, color: colors.textSecondary },
          ]}
        >
          {item.state}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.pickerInput, !!error && styles.pickerInputError]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.pickerText, !value && styles.placeholderText]}>
            {value ? value.name : placeholder}
          </Text>
          {value && (
            <Text
              style={[
                styles.pickerText,
                { fontSize: 12, color: colors.textSecondary },
              ]}
            >
              {value.state}
            </Text>
          )}
        </View>
        <ChevronDownIcon />
      </TouchableOpacity>

      {value && (
        <TouchableOpacity
          onPress={handleClearSelection}
          style={{ marginTop: 8, alignSelf: 'flex-start' }}
        >
          <Text style={{ color: colors.primary, fontSize: 14 }}>
            Clear selection
          </Text>
        </TouchableOpacity>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select School</Text>
              <Button variant="ghost" size="small" onPress={handleCloseModal}>
                Done
              </Button>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search for your school..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              clearButtonMode="while-editing"
            />

            <FlatList
              data={filteredSchools}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>
                    {searchQuery
                      ? 'No schools found matching your search.'
                      : 'No schools available.'}
                  </Text>
                  {searchQuery && (
                    <Text
                      style={[
                        styles.emptyStateText,
                        { marginTop: 8, fontSize: 14 },
                      ]}
                    >
                      Try adjusting your search terms.
                    </Text>
                  )}
                </View>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};
