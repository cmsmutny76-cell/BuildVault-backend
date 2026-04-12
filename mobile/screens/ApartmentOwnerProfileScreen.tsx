import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {
  ApartmentClass,
  BudgetRange,
  BusinessEntityType,
  RenovationScope,
} from '../types/profiles';

interface ApartmentOwnerProfileScreenProps {
  onBack: () => void;
  isInitialSetup?: boolean;
}

type StepKey = 'organization' | 'portfolio' | 'focus' | 'location';

const STEP_ORDER: StepKey[] = ['organization', 'portfolio', 'focus', 'location'];

export default function ApartmentOwnerProfileScreen({
  onBack,
  isInitialSetup,
}: ApartmentOwnerProfileScreenProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>('organization');

  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessEntityType>('llc');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [propertyCount, setPropertyCount] = useState('');
  const [totalUnitCount, setTotalUnitCount] = useState('');
  const [apartmentClass, setApartmentClass] = useState<ApartmentClass>('class-b');

  const [renovationFocus, setRenovationFocus] = useState<RenovationScope[]>(['turnover-prep']);
  const [typicalBudgetRanges, setTypicalBudgetRanges] = useState<BudgetRange[]>(['50k-100k']);
  const [isAcceptingNewProjects, setIsAcceptingNewProjects] = useState(true);

  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [serviceRadius, setServiceRadius] = useState('20');
  const [additionalZips, setAdditionalZips] = useState('');

  const toggleRenovationFocus = (scope: RenovationScope) => {
    if (renovationFocus.includes(scope)) {
      setRenovationFocus(renovationFocus.filter((item) => item !== scope));
      return;
    }

    setRenovationFocus([...renovationFocus, scope]);
  };

  const toggleBudgetRange = (range: BudgetRange) => {
    if (typicalBudgetRanges.includes(range)) {
      setTypicalBudgetRanges(typicalBudgetRanges.filter((item) => item !== range));
      return;
    }

    setTypicalBudgetRanges([...typicalBudgetRanges, range]);
  };

  const handleSave = () => {
    if (!companyName || !email || !phone || !city || !state || !zipCode) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (!totalUnitCount) {
      Alert.alert('Missing Information', 'Please enter the total unit count for your apartment portfolio.');
      return;
    }

    if (renovationFocus.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one renovation focus area.');
      return;
    }

    Alert.alert(
      'Apartment Owner Profile Saved',
      'Your apartment owner profile has been updated to tailor contractor matching to your unit count and renovation focus.',
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const renderOrganization = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏢 Organization</Text>

      <Text style={styles.label}>Company or Ownership Entity *</Text>
      <TextInput
        style={styles.input}
        placeholder="Northline Apartment Holdings"
        placeholderTextColor="#94a3b8"
        value={companyName}
        onChangeText={setCompanyName}
      />

      <Text style={styles.label}>Business Type *</Text>
      <View style={styles.buttonGroup}>
        {(['sole-proprietor', 'llc', 'corporation', 'partnership'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.optionButton, businessType === type && styles.optionButtonActive]}
            onPress={() => setBusinessType(type)}
          >
            <Text style={[styles.optionText, businessType === type && styles.optionTextActive]}>
              {type === 'sole-proprietor'
                ? 'Sole Proprietor'
                : type === 'llc'
                  ? 'LLC'
                  : type === 'corporation'
                    ? 'Corporation'
                    : 'Partnership'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Email Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="renovations@northlineapts.com"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="(555) 774-2200"
        placeholderTextColor="#94a3b8"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
    </View>
  );

  const renderPortfolio = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏙️ Property Portfolio</Text>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Apartment Properties</Text>
          <TextInput
            style={styles.input}
            placeholder="6"
            placeholderTextColor="#94a3b8"
            value={propertyCount}
            onChangeText={setPropertyCount}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Total Unit Count *</Text>
          <TextInput
            style={styles.input}
            placeholder="214"
            placeholderTextColor="#94a3b8"
            value={totalUnitCount}
            onChangeText={setTotalUnitCount}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <Text style={styles.helperText}>
        Unit count helps tailor contractor matching for turnover volume, common-area scope, and project scale.
      </Text>

      <Text style={styles.label}>Apartment Class *</Text>
      <View style={styles.buttonGroup}>
        {(['class-a', 'class-b', 'class-c'] as ApartmentClass[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.optionButton, apartmentClass === type && styles.optionButtonActive]}
            onPress={() => setApartmentClass(type)}
          >
            <Text style={[styles.optionText, apartmentClass === type && styles.optionTextActive]}>
              {type.toUpperCase().replace('-', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          📊 Apartment class and unit volume help surface contractors who can handle the finish level and turnover speed your assets require.
        </Text>
      </View>
    </View>
  );

  const renderFocus = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔨 Renovation Focus</Text>

      <Text style={styles.label}>Focus Areas * (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(
          ['full-rehab', 'turnover-prep', 'common-areas', 'amenities', 'exterior-facade', 'building-systems'] as RenovationScope[]
        ).map((scope) => (
          <TouchableOpacity
            key={scope}
            style={[styles.serviceChip, renovationFocus.includes(scope) && styles.serviceChipActive]}
            onPress={() => toggleRenovationFocus(scope)}
          >
            <Text style={[styles.serviceChipText, renovationFocus.includes(scope) && styles.serviceChipTextActive]}>
              {scope.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Typical Budget Ranges</Text>
      <View style={styles.buttonGroup}>
        {(['50k-100k', '100k-250k', '250k-500k', '500k-plus'] as BudgetRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.serviceChip, typicalBudgetRanges.includes(range) && styles.serviceChipActive]}
            onPress={() => toggleBudgetRange(range)}
          >
            <Text style={[styles.serviceChipText, typicalBudgetRanges.includes(range) && styles.serviceChipTextActive]}>
              ${range.replace(/k/g, 'K').replace('-plus', '+').replace('-', ' - $')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Project Intake</Text>
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setIsAcceptingNewProjects(!isAcceptingNewProjects)}
      >
        <View style={[styles.checkbox, isAcceptingNewProjects && styles.checkboxChecked]}>
          {isAcceptingNewProjects && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Currently Accepting New Renovation Opportunities</Text>
      </TouchableOpacity>

      <View style={styles.matchingCard}>
        <Text style={styles.matchingTitle}>🤖 Apartment Matching Active</Text>
        <Text style={styles.matchingText}>
          Contractor ranking will account for turnover workload, common-area scope, building systems experience, and the scale implied by your unit count.
        </Text>
      </View>
    </View>
  );

  const renderLocation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📍 Location</Text>

      <Text style={styles.label}>Primary Market - City *</Text>
      <TextInput
        style={styles.input}
        placeholder="Atlanta"
        placeholderTextColor="#94a3b8"
        value={city}
        onChangeText={setCity}
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            placeholder="GA"
            placeholderTextColor="#94a3b8"
            value={state}
            onChangeText={setState}
            maxLength={2}
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>ZIP Code *</Text>
          <TextInput
            style={styles.input}
            placeholder="30303"
            placeholderTextColor="#94a3b8"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>
      </View>

      <Text style={styles.label}>Coverage Radius (miles) *</Text>
      <TextInput
        style={styles.input}
        placeholder="20"
        placeholderTextColor="#94a3b8"
        value={serviceRadius}
        onChangeText={setServiceRadius}
        keyboardType="number-pad"
      />
      <Text style={styles.helperText}>
        Use this to limit contractor suggestions to crews that can respond consistently across your apartment footprint.
      </Text>

      <Text style={styles.label}>Additional ZIP Codes (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="30308, 30309, 30318"
        placeholderTextColor="#94a3b8"
        value={additionalZips}
        onChangeText={setAdditionalZips}
      />
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'organization':
        return renderOrganization();
      case 'portfolio':
        return renderPortfolio();
      case 'focus':
        return renderFocus();
      case 'location':
        return renderLocation();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isInitialSetup ? 'Complete Your Apartment Owner Profile' : 'Edit Apartment Owner Profile'}
        </Text>
      </View>

      <View style={styles.stepIndicator}>
        {STEP_ORDER.map((step, index) => (
          <React.Fragment key={step}>
            <TouchableOpacity
              style={[
                styles.stepDot,
                currentStep === step && styles.stepDotActive,
                STEP_ORDER.indexOf(currentStep) > index && styles.stepDotCompleted,
              ]}
              onPress={() => setCurrentStep(step)}
            >
              <Text
                style={[
                  styles.stepNumber,
                  (currentStep === step || STEP_ORDER.indexOf(currentStep) > index) && styles.stepNumberActive,
                ]}
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
            {index < STEP_ORDER.length - 1 && <View style={styles.stepLine} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStepContent()}

        <View style={styles.navigationButtons}>
          {currentStep !== 'organization' && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                const currentIndex = STEP_ORDER.indexOf(currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(STEP_ORDER[currentIndex - 1]);
                }
              }}
            >
              <Text style={styles.secondaryButtonText}>← Previous</Text>
            </TouchableOpacity>
          )}

          {currentStep !== 'location' ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                const currentIndex = STEP_ORDER.indexOf(currentStep);
                if (currentIndex < STEP_ORDER.length - 1) {
                  setCurrentStep(STEP_ORDER[currentIndex + 1]);
                }
              }}
            >
              <Text style={styles.primaryButtonText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>💾 Save Apartment Owner Profile</Text>
            </TouchableOpacity>
          )}
        </View>

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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepDotActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  stepDotCompleted: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    borderColor: '#D4AF37',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  stepNumberActive: {
    color: '#0f172a',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  optionText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#0f172a',
  },
  serviceChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 8,
    marginBottom: 8,
  },
  serviceChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    borderColor: '#D4AF37',
  },
  serviceChipText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  serviceChipTextActive: {
    color: '#D4AF37',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  checkmark: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#cbd5e1',
  },
  helperText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  infoText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  matchingCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  matchingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 8,
  },
  matchingText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  secondaryButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
});