import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MobileScreenHeader from '../components/MobileScreenHeader';
import { userAPI, type MobileUserType } from '../services/api';

interface SupplierProfileScreenProps {
  onBack: () => void;
  userId: string;
}

type SupplierFormState = {
  businessName: string;
  supplierDescription: string;
  city: string;
  state: string;
  serviceAreas: string;
  supplierCategories: string;
  supplierSpecialServices: string;
  customOrderMaterials: string;
  catalogSheetUrls: string;
  leadTimeDetails: string;
  minimumOrderQuantities: string;
  fabricationCapabilities: string;
  supplierVisibilityRestricted: boolean;
  supplierAudience: MobileUserType[];
};

const ALL_AUDIENCES: Array<{ value: MobileUserType; label: string }> = [
  { value: 'homeowner', label: 'Homeowners' },
  { value: 'employment_seeker', label: 'Employment Seekers' },
  { value: 'contractor', label: 'Contractors' },
  { value: 'supplier', label: 'Suppliers' },
  { value: 'commercial_builder', label: 'Commercial Builders' },
  { value: 'multi_family_owner', label: 'Multi-family Owners' },
  { value: 'apartment_owner', label: 'Apartment Owners' },
  { value: 'developer', label: 'Developers' },
  { value: 'landscaper', label: 'Landscapers' },
  { value: 'school', label: 'Schools' },
];

function asCsv(value: unknown): string {
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string').join(', ');
  if (typeof value === 'string') return value;
  return '';
}

function parseCsv(text: string): string[] {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function SupplierProfileScreen({ onBack, userId }: SupplierProfileScreenProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SupplierFormState>({
    businessName: '',
    supplierDescription: '',
    city: '',
    state: '',
    serviceAreas: '',
    supplierCategories: '',
    supplierSpecialServices: '',
    customOrderMaterials: '',
    catalogSheetUrls: '',
    leadTimeDetails: '',
    minimumOrderQuantities: '',
    fabricationCapabilities: '',
    supplierVisibilityRestricted: true,
    supplierAudience: ['contractor', 'commercial_builder', 'developer', 'landscaper'],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const result = await userAPI.getProfile(userId);
        const profile = result.profile || {};

        setForm((current) => ({
          ...current,
          businessName: (profile.businessName as string) || '',
          supplierDescription: (profile.supplierDescription as string) || '',
          city: (profile.city as string) || '',
          state: (profile.state as string) || '',
          serviceAreas: asCsv(profile.serviceAreas),
          supplierCategories: asCsv(profile.supplierCategories),
          supplierSpecialServices: asCsv(profile.supplierSpecialServices),
          customOrderMaterials: asCsv(profile.customOrderMaterials),
          catalogSheetUrls: asCsv(profile.catalogSheetUrls),
          leadTimeDetails: (profile.leadTimeDetails as string) || '',
          minimumOrderQuantities: (profile.minimumOrderQuantities as string) || '',
          fabricationCapabilities: (profile.fabricationCapabilities as string) || '',
          supplierVisibilityRestricted:
            typeof profile.supplierVisibilityRestricted === 'boolean'
              ? profile.supplierVisibilityRestricted
              : true,
          supplierAudience: Array.isArray(profile.supplierAudience)
            ? (profile.supplierAudience as MobileUserType[])
            : current.supplierAudience,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load profile';
        Alert.alert('Unable to load supplier profile', message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  const selectedAudienceSummary = useMemo(() => {
    if (!form.supplierVisibilityRestricted) return 'Visible to all account types';
    if (!form.supplierAudience.length) return 'No audience selected';
    return `${form.supplierAudience.length} audience types selected`;
  }, [form.supplierVisibilityRestricted, form.supplierAudience]);

  const toggleAudience = (value: MobileUserType) => {
    setForm((current) => {
      const exists = current.supplierAudience.includes(value);
      return {
        ...current,
        supplierAudience: exists
          ? current.supplierAudience.filter((entry) => entry !== value)
          : [...current.supplierAudience, value],
      };
    });
  };

  const handleSave = async () => {
    if (!form.businessName.trim()) {
      Alert.alert('Business name required', 'Please enter your supplier business name.');
      return;
    }

    setSaving(true);

    try {
      await userAPI.updateProfile(userId, {
        id: userId,
        userType: 'supplier',
        businessName: form.businessName,
        city: form.city,
        state: form.state.toUpperCase(),
        serviceAreas: parseCsv(form.serviceAreas),
        supplierCategories: parseCsv(form.supplierCategories),
        supplierDescription: form.supplierDescription,
        supplierVisibilityRestricted: form.supplierVisibilityRestricted,
        supplierAudience: form.supplierAudience,
        supplierSpecialServices: parseCsv(form.supplierSpecialServices),
        customOrderMaterials: parseCsv(form.customOrderMaterials),
        catalogSheetUrls: parseCsv(form.catalogSheetUrls),
        leadTimeDetails: form.leadTimeDetails,
        minimumOrderQuantities: form.minimumOrderQuantities,
        fabricationCapabilities: form.fabricationCapabilities,
      });

      Alert.alert('Saved', 'Supplier profile updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update supplier profile';
      Alert.alert('Save failed', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <MobileScreenHeader
          onBack={onBack}
          backLabel="<- Back"
          title="Supplier Profile"
          subtitle="Configure visibility and materials"
          theme="dark"
        />
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loaderText}>Loading supplier profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MobileScreenHeader
        onBack={onBack}
        backLabel="<- Back"
        title="Supplier Profile"
        subtitle="Configure visibility and materials"
        theme="dark"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Business Name</Text>
          <TextInput
            style={styles.input}
            value={form.businessName}
            onChangeText={(text) => setForm((current) => ({ ...current, businessName: text }))}
            placeholder="BuildSource Supply Co."
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            multiline
            value={form.supplierDescription}
            onChangeText={(text) => setForm((current) => ({ ...current, supplierDescription: text }))}
            placeholder="Tell contractors what makes your supply operation stand out"
            placeholderTextColor="#94a3b8"
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={form.city}
                onChangeText={(text) => setForm((current) => ({ ...current, city: text }))}
                placeholder="Houston"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={form.state}
                onChangeText={(text) => setForm((current) => ({ ...current, state: text }))}
                placeholder="TX"
                placeholderTextColor="#94a3b8"
                maxLength={2}
              />
            </View>
          </View>

          <Text style={styles.label}>Service Areas (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={form.serviceAreas}
            onChangeText={(text) => setForm((current) => ({ ...current, serviceAreas: text }))}
            placeholder="Houston Metro, Austin"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Material Categories (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={form.supplierCategories}
            onChangeText={(text) => setForm((current) => ({ ...current, supplierCategories: text }))}
            placeholder="Concrete, Lumber, Fasteners"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Special Services (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={form.supplierSpecialServices}
            onChangeText={(text) => setForm((current) => ({ ...current, supplierSpecialServices: text }))}
            placeholder="Jobsite delivery, Takeoff assistance"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Custom Order Materials (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={form.customOrderMaterials}
            onChangeText={(text) => setForm((current) => ({ ...current, customOrderMaterials: text }))}
            placeholder="Custom truss packages, Special stone veneer"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Catalog Sheet URLs (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={form.catalogSheetUrls}
            onChangeText={(text) => setForm((current) => ({ ...current, catalogSheetUrls: text }))}
            placeholder="https://example.com/catalog.pdf"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Lead Time Details</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            multiline
            value={form.leadTimeDetails}
            onChangeText={(text) => setForm((current) => ({ ...current, leadTimeDetails: text }))}
            placeholder="Standard materials 1-3 days"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Minimum Order Quantities</Text>
          <TextInput
            style={styles.input}
            value={form.minimumOrderQuantities}
            onChangeText={(text) => setForm((current) => ({ ...current, minimumOrderQuantities: text }))}
            placeholder="Bulk steel requires pallet minimums"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Fabrication Capabilities</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            multiline
            value={form.fabricationCapabilities}
            onChangeText={(text) => setForm((current) => ({ ...current, fabricationCapabilities: text }))}
            placeholder="Cut-to-length, prefab package coordination"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextWrap}>
              <Text style={styles.switchLabel}>Restrict visibility by audience</Text>
              <Text style={styles.switchHint}>{selectedAudienceSummary}</Text>
            </View>
            <Switch
              value={form.supplierVisibilityRestricted}
              onValueChange={(value) => setForm((current) => ({ ...current, supplierVisibilityRestricted: value }))}
              trackColor={{ false: '#334155', true: '#3b82f6' }}
              thumbColor={form.supplierVisibilityRestricted ? '#2563eb' : '#cbd5e1'}
            />
          </View>

          {form.supplierVisibilityRestricted ? (
            <View style={styles.audienceGrid}>
              {ALL_AUDIENCES.map((audience) => {
                const selected = form.supplierAudience.includes(audience.value);
                return (
                  <TouchableOpacity
                    key={audience.value}
                    style={[styles.audienceChip, selected ? styles.audienceChipSelected : null]}
                    onPress={() => toggleAudience(audience.value)}
                  >
                    <Text style={[styles.audienceChipText, selected ? styles.audienceChipTextSelected : null]}>
                      {audience.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving ? styles.saveButtonDisabled : null]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Supplier Profile'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loaderText: {
    color: '#cbd5e1',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
  },
  label: {
    color: '#e2e8f0',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfField: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  switchLabel: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  switchHint: {
    color: '#94a3b8',
    marginTop: 4,
  },
  audienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audienceChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  audienceChipSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1d4ed8',
  },
  audienceChipText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  audienceChipTextSelected: {
    color: '#eff6ff',
  },
  saveButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 16,
  },
});
