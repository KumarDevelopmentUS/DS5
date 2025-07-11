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
// Assuming a core Button component exists
// import { Button } from '../../core/Button';

// --- Mock Component (Remove when you have the real one) ---
const Button = ({ children, ...props }: any) => (
  <TouchableOpacity {...props}>
    <Text>{children}</Text>
  </TouchableOpacity>
);
// --- End Mock Component ---

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
        school.display.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery]);

  const handleSelectSchool = (school: School) => {
    onSelect(school);
    setModalVisible(false);
    setSearchQuery('');
  };

  const renderItem = ({ item }: { item: School }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleSelectSchool(item)}
    >
      <Text style={styles.listItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.pickerInput, !!error && styles.pickerInputError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.pickerText, !value && styles.placeholderText]}>
          {value ? value.name : placeholder}
        </Text>
        {/* You could add a dropdown icon here */}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select School</Text>
              <Button onPress={() => setModalVisible(false)}>
                <Text>Close</Text>
              </Button>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a school..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <FlatList
              data={filteredSchools}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>No schools found.</Text>
                </View>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};
