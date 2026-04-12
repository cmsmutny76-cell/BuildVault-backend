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
  LandscaperClientType,
  LandscapingServiceType,
} from '../types/profiles';

interface LandscaperProfileScreenProps {
  onBack: () => void;
  isInitialSetup?: boolean;
}

type StepKey = 'business' | 'services' | 'certifications' | 'area';

const STEP_ORDER: StepKey[] = ['business', 'services', 'certifications', 'area'];

export default function LandscaperProfileScreen({
  onBack,
  isInitialSetup,
}: LandscaperProfileScreenProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>('business');

  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessEntityType>('llc');
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  const [landscapingServices, setLandscapingServices] = useState<LandscapingServiceType[]>(['installation']);
  const [clientTypes, setClientTypes] = useState<LandscaperClientType[]>(['commercial']);
  const [typicalBudgetRanges, setTypicalBudgetRanges] = useState<BudgetRange[]>(['15k-50k']);

  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [isInsured, setIsInsured] = useState(false);
  const [isBonded, setIsBonded] = useState(false);
  const [isIsaCertifiedArborist, setIsIsaCertifiedArborist] = useState(false);
  const [isNalpCertified, setIsNalpCertified] = useState(false);

  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [serviceRadius, setServiceRadius] = useState('30');
  const [additionalZips, setAdditionalZips] = useState('');
  const [maximumAccounts, setMaximumAccounts] = useState('8');

  const toggleLandscapingService = (service: LandscapingServiceType) => {
    if (landscapingServices.includes(service)) {
      setLandscapingServices(landscapingServices.filter((item) => item !== service));
      return;
    }

    setLandscapingServices([...landscapingServices, service]);
  };

  const toggleClientType = (clientType: LandscaperClientType) => {
    if (clientTypes.includes(clientType)) {
      setClientTypes(clientTypes.filter((item) => item !== clientType));
      return;
    }

    setClientTypes([...clientTypes, clientType]);
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

    if (landscapingServices.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one landscaping service.');
      return;
    }

    if (clientTypes.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one client type.');
      return;
    }

    Alert.alert(
      'Landscaper Profile Saved',
      'Your landscaping profile has been updated for property and service-area matching.',
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const renderBusinessInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🌿 Business Information</Text>

      <Text style={styles.label}>Company Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Evergreen Outdoor Services"
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

      <Text style={styles.label}>Years in Business *</Text>
      <TextInput
        style={styles.input}
        placeholder="11"
        placeholderTextColor="#94a3b8"
        value={yearsInBusiness}
        onChangeText={setYearsInBusiness}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Email Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="bids@evergreenoutdoor.com"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="(555) 702-1900"
        placeholderTextColor="#94a3b8"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Website (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="www.evergreenoutdoor.com"
        placeholderTextColor="#94a3b8"
        value={website}
        onChangeText={setWebsite}
        autoCapitalize="none"
      />
    </View>
  );

  const renderServices = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🛠️ Services & Specializations</Text>

      <Text style={styles.label}>Services Offered * (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(
          ['design', 'installation', 'maintenance', 'irrigation', 'hardscaping', 'tree-service', 'turf-management', 'snow-removal'] as LandscapingServiceType[]
        ).map((service) => (
          <TouchableOpacity
            key={service}
            style={[styles.serviceChip, landscapingServices.includes(service) && styles.serviceChipActive]}
            onPress={() => toggleLandscapingService(service)}
          >
            <Text style={[styles.serviceChipText, landscapingServices.includes(service) && styles.serviceChipTextActive]}>
              {service.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Client Types * (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(['residential', 'commercial', 'hoa', 'municipal', 'golf-recreation'] as LandscaperClientType[]).map((clientType) => (
          <TouchableOpacity
            key={clientType}
            style={[styles.serviceChip, clientTypes.includes(clientType) && styles.serviceChipActive]}
            onPress={() => toggleClientType(clientType)}
          >
            <Text style={[styles.serviceChipText, clientTypes.includes(clientType) && styles.serviceChipTextActive]}>
              {clientType.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Typical Budget Ranges</Text>
      <View style={styles.buttonGroup}>
        {(['5k-15k', '15k-50k', '50k-100k', '100k-250k'] as BudgetRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.serviceChip, typicalBudgetRanges.includes(range) && styles.serviceChipActive]}
            onPress={() => toggleBudgetRange(range)}
          >
            <Text style={[styles.serviceChipText, typicalBudgetRanges.includes(range) && styles.serviceChipTextActive]}>
              ${range.replace(/k/g, 'K').replace('-', ' - $')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.matchingCard}>
        <Text style={styles.matchingTitle}>🤖 Landscape Matching Active</Text>
        <Text style={styles.matchingText}>
          Matching will prioritize properties based on service mix, client type, and budget fit for installation and ongoing maintenance work.
        </Text>
      </View>
    </View>
  );

  const renderCertifications = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📜 Licenses & Certifications</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          🏆 Certifications and insurance increase confidence for schools, property owners, and commercial sites reviewing your profile.
        </Text>
      </View>

      <Text style={styles.label}>License Number</Text>
      <TextInput
        style={styles.input}
        placeholder="LND-204991"
        placeholderTextColor="#94a3b8"
        value={licenseNumber}
        onChangeText={setLicenseNumber}
      />

      <Text style={styles.label}>License State</Text>
      <TextInput
        style={styles.input}
        placeholder="CA"
        placeholderTextColor="#94a3b8"
        value={licenseState}
        onChangeText={setLicenseState}
        maxLength={2}
      />

      <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsInsured(!isInsured)}>
        <View style={[styles.checkbox, isInsured && styles.checkboxChecked]}>
          {isInsured && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Currently Insured</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsBonded(!isBonded)}>
        <View style={[styles.checkbox, isBonded && styles.checkboxChecked]}>
          {isBonded && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Currently Bonded</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setIsIsaCertifiedArborist(!isIsaCertifiedArborist)}
      >
        <View style={[styles.checkbox, isIsaCertifiedArborist && styles.checkboxChecked]}>
          {isIsaCertifiedArborist && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>ISA Certified Arborist</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsNalpCertified(!isNalpCertified)}>
        <View style={[styles.checkbox, isNalpCertified && styles.checkboxChecked]}>
          {isNalpCertified && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>NALP Certified</Text>
      </TouchableOpacity>
    </View>
  );

  const renderServiceArea = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📍 Service Area</Text>

      <Text style={styles.label}>Primary City *</Text>
      <TextInput
        style={styles.input}
        placeholder="Sacramento"
        placeholderTextColor="#94a3b8"
        value={city}
        onChangeText={setCity}
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            placeholder="CA"
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
            placeholder="95814"
            placeholderTextColor="#94a3b8"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>
      </View>

      <Text style={styles.label}>Service Radius (miles) *</Text>
      <TextInput
        style={styles.input}
        placeholder="30"
        placeholderTextColor="#94a3b8"
        value={serviceRadius}
        onChangeText={setServiceRadius}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Additional ZIP Codes (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="95608, 95610, 95821"
        placeholderTextColor="#94a3b8"
        value={additionalZips}
        onChangeText={setAdditionalZips}
      />

      <Text style={styles.label}>Maximum Accounts Per Month</Text>
      <TextInput
        style={styles.input}
        placeholder="8"
        placeholderTextColor="#94a3b8"
        value={maximumAccounts}
        onChangeText={setMaximumAccounts}
        keyboardType="number-pad"
      />
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'business':
        return renderBusinessInfo();
      case 'services':
        return renderServices();
      case 'certifications':
        return renderCertifications();
      case 'area':
        return renderServiceArea();
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
          {isInitialSetup ? 'Complete Your Landscaper Profile' : 'Edit Landscaper Profile'}
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
          {currentStep !== 'business' && (
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

          {currentStep !== 'area' ? (
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
              <Text style={styles.saveButtonText}>💾 Save Landscaper Profile</Text>
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