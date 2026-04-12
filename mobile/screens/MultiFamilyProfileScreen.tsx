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
  BudgetRange,
  BusinessEntityType,
  MultiFamilyPropertyType,
  RenovationScope,
} from '../types/profiles';

interface MultiFamilyProfileScreenProps {
  onBack: () => void;
  isInitialSetup?: boolean;
}

type StepKey = 'organization' | 'portfolio' | 'scope' | 'location';

const STEP_ORDER: StepKey[] = ['organization', 'portfolio', 'scope', 'location'];

export default function MultiFamilyProfileScreen({
  onBack,
  isInitialSetup,
}: MultiFamilyProfileScreenProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>('organization');

  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessEntityType>('llc');
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [portfolioPropertyCount, setPortfolioPropertyCount] = useState('');
  const [totalManagedUnits, setTotalManagedUnits] = useState('');
  const [propertyTypes, setPropertyTypes] = useState<MultiFamilyPropertyType[]>(['small-complex']);

  const [renovationScopes, setRenovationScopes] = useState<RenovationScope[]>(['unit-upgrades']);
  const [typicalBudgetRanges, setTypicalBudgetRanges] = useState<BudgetRange[]>(['100k-250k']);
  const [maxProjects, setMaxProjects] = useState('4');

  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [serviceRadius, setServiceRadius] = useState('35');
  const [additionalZips, setAdditionalZips] = useState('');

  const togglePropertyType = (propertyType: MultiFamilyPropertyType) => {
    if (propertyTypes.includes(propertyType)) {
      setPropertyTypes(propertyTypes.filter((item) => item !== propertyType));
      return;
    }

    setPropertyTypes([...propertyTypes, propertyType]);
  };

  const toggleRenovationScope = (scope: RenovationScope) => {
    if (renovationScopes.includes(scope)) {
      setRenovationScopes(renovationScopes.filter((item) => item !== scope));
      return;
    }

    setRenovationScopes([...renovationScopes, scope]);
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

    if (propertyTypes.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one property type.');
      return;
    }

    if (renovationScopes.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one renovation scope.');
      return;
    }

    Alert.alert(
      'Multi-Family Profile Saved',
      'Your multi-family owner profile has been updated for portfolio and renovation matching.',
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const renderOrganization = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏘️ Organization</Text>

      <Text style={styles.label}>Company or Ownership Group Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Blue Oak Property Group"
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

      <Text style={styles.label}>Years Operating Multi-Family Assets *</Text>
      <TextInput
        style={styles.input}
        placeholder="9"
        placeholderTextColor="#94a3b8"
        value={yearsInBusiness}
        onChangeText={setYearsInBusiness}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Email Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="capitalprojects@blueoak.com"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="(555) 333-4411"
        placeholderTextColor="#94a3b8"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
    </View>
  );

  const renderPortfolio = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏢 Property Portfolio</Text>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Portfolio Properties *</Text>
          <TextInput
            style={styles.input}
            placeholder="12"
            placeholderTextColor="#94a3b8"
            value={portfolioPropertyCount}
            onChangeText={setPortfolioPropertyCount}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Total Managed Units *</Text>
          <TextInput
            style={styles.input}
            placeholder="486"
            placeholderTextColor="#94a3b8"
            value={totalManagedUnits}
            onChangeText={setTotalManagedUnits}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <Text style={styles.label}>Property Types * (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(
          ['duplex', 'triplex', 'townhome-community', 'small-complex', 'large-complex'] as MultiFamilyPropertyType[]
        ).map((propertyType) => (
          <TouchableOpacity
            key={propertyType}
            style={[styles.serviceChip, propertyTypes.includes(propertyType) && styles.serviceChipActive]}
            onPress={() => togglePropertyType(propertyType)}
          >
            <Text style={[styles.serviceChipText, propertyTypes.includes(propertyType) && styles.serviceChipTextActive]}>
              {propertyType.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          📊 Portfolio size and property mix help prioritize contractors with the right crew scale and turnover capacity.
        </Text>
      </View>
    </View>
  );

  const renderScope = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔧 Project Scope</Text>

      <Text style={styles.label}>Renovation Scope * (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(
          ['full-rehab', 'unit-upgrades', 'common-areas', 'building-systems', 'exterior-facade', 'amenities'] as RenovationScope[]
        ).map((scope) => (
          <TouchableOpacity
            key={scope}
            style={[styles.serviceChip, renovationScopes.includes(scope) && styles.serviceChipActive]}
            onPress={() => toggleRenovationScope(scope)}
          >
            <Text style={[styles.serviceChipText, renovationScopes.includes(scope) && styles.serviceChipTextActive]}>
              {scope.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Typical Budget Ranges (Select all that apply)</Text>
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

      <Text style={styles.label}>Maximum Simultaneous Projects</Text>
      <TextInput
        style={styles.input}
        placeholder="4"
        placeholderTextColor="#94a3b8"
        value={maxProjects}
        onChangeText={setMaxProjects}
        keyboardType="number-pad"
      />

      <View style={styles.matchingCard}>
        <Text style={styles.matchingTitle}>🤖 Portfolio Matching Active</Text>
        <Text style={styles.matchingText}>
          Contractors will be ranked based on unit-turn readiness, crew capacity, common-area experience, and budget fit for your portfolio.
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
        placeholder="Phoenix"
        placeholderTextColor="#94a3b8"
        value={city}
        onChangeText={setCity}
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            placeholder="AZ"
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
            placeholder="85004"
            placeholderTextColor="#94a3b8"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>
      </View>

      <Text style={styles.label}>Portfolio Radius (miles) *</Text>
      <TextInput
        style={styles.input}
        placeholder="35"
        placeholderTextColor="#94a3b8"
        value={serviceRadius}
        onChangeText={setServiceRadius}
        keyboardType="number-pad"
      />
      <Text style={styles.helperText}>
        Use this to focus contractor matching around your core market and nearby submarkets.
      </Text>

      <Text style={styles.label}>Additional ZIP Codes (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="85008, 85281, 85282"
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
      case 'scope':
        return renderScope();
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
          {isInitialSetup ? 'Complete Your Multi-Family Profile' : 'Edit Multi-Family Profile'}
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
              <Text style={styles.saveButtonText}>💾 Save Multi-Family Profile</Text>
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