import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import MobileScreenHeader from '../components/MobileScreenHeader';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface CreateProjectScreenProps {
  currentUserId: string;
  onProjectCreated: (project: any) => void;
  onBack: () => void;
}

export default function CreateProjectScreen({
  currentUserId,
  onProjectCreated,
  onBack,
}: CreateProjectScreenProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectType: 'residential',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [loading, setLoading] = useState(false);

  const projectTypes = [
    { value: 'residential', label: 'Residential', icon: '🏠' },
    { value: 'commercial', label: 'Commercial', icon: '🏢' },
    { value: 'apartment', label: 'Apartment', icon: '🏬' },
    { value: 'landscaping', label: 'Landscaping', icon: '🌳' },
    { value: 'renovation', label: 'Renovation', icon: '🔨' },
    { value: 'construction', label: 'New Construction', icon: '🏗️' },
    { value: 'repair', label: 'Repair', icon: '🔧' },
  ];

  const handleCreateProject = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a project title');
      return;
    }

    if (!formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim()) {
      Alert.alert('Error', 'Please enter city, state, and zip code');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId: currentUserId,
          projectType: formData.projectType,
          title: formData.title,
          description: formData.description || undefined,
          location: {
            street: formData.street || undefined,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Project created successfully!', [
          {
            text: 'OK',
            onPress: () => onProjectCreated(data.project),
          },
        ]);
      } else {
        Alert.alert('Error', data.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Create project error:', error);
      Alert.alert('Error', 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MobileScreenHeader
        onBack={onBack}
        backLabel="← Cancel"
        title="Create Project"
        subtitle="Set up the project details and location to start matching work"
        theme="dark"
      />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Project Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="e.g., Kitchen Remodel, New Deck, Bathroom Renovation"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Brief description of your project..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Project Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.typeGrid}>
              {projectTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeCard,
                    formData.projectType === type.value && styles.typeCardSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, projectType: type.value })}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      formData.projectType === type.value && styles.typeLabelSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Location</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street Address (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.street}
              onChangeText={(text) => setFormData({ ...formData, street: text })}
              placeholder="123 Main St"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              City <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="San Francisco"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>
                State <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text.toUpperCase() })}
                placeholder="CA"
                placeholderTextColor="#94a3b8"
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>
                Zip Code <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.zipCode}
                onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
                placeholder="94102"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateProject}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating Project...' : 'Create Project'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.22)',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  typeCard: {
    width: '31%',
    margin: '1%',
    backgroundColor: 'rgba(15,23,42,0.88)',
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.18)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  typeCardSelected: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
  typeLabelSelected: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  createButton: {
    backgroundColor: '#D4AF37',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
});
