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
  CommercialProjectType,
  ProjectScaleRange,
} from '../types/profiles';

interface CommercialBuilderProfileScreenProps {
  onBack: () => void;
  isInitialSetup?: boolean;
}

type StepKey = 'business' | 'projects' | 'certifications' | 'area';

const STEP_ORDER: StepKey[] = ['business', 'projects', 'certifications', 'area'];

export default function CommercialBuilderProfileScreen({
  onBack,
  isInitialSetup,
}: CommercialBuilderProfileScreenProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>('business');

  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessEntityType>('llc');
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [completedProjects, setCompletedProjects] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  const [commercialProjectTypes, setCommercialProjectTypes] = useState<CommercialProjectType[]>(['office']);
  const [typicalProjectScales, setTypicalProjectScales] = useState<ProjectScaleRange[]>(['500k-2m']);
  const [typicalBudgetRanges, setTypicalBudgetRanges] = useState<BudgetRange[]>(['100k-250k']);
  const [activeBids, setActiveBids] = useState('');

  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [isInsured, setIsInsured] = useState(false);
  const [isBonded, setIsBonded] = useState(false);

  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [serviceRadius, setServiceRadius] = useState('50');
  const [additionalZips, setAdditionalZips] = useState('');
  const [isAccepting, setIsAccepting] = useState(true);
  const [maxProjects, setMaxProjects] = useState('5');

  const toggleCommercialProjectType = (projectType: CommercialProjectType) => {
    if (commercialProjectTypes.includes(projectType)) {
      setCommercialProjectTypes(commercialProjectTypes.filter((item) => item !== projectType));
      return;
    }

    setCommercialProjectTypes([...commercialProjectTypes, projectType]);
  };

  const toggleProjectScale = (scale: ProjectScaleRange) => {
    if (typicalProjectScales.includes(scale)) {
      setTypicalProjectScales(typicalProjectScales.filter((item) => item !== scale));
      return;
    }

    setTypicalProjectScales([...typicalProjectScales, scale]);
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

    if (commercialProjectTypes.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one commercial project type.');
      return;
    }

    if (typicalProjectScales.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one project scale.');
      return;
    }

    Alert.alert(
      'Commercial Builder Profile Saved',
      'Your commercial builder profile has been updated for higher-value project matching.',
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const renderBusinessInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏢 Commercial Builder Information</Text>

      <Text style={styles.label}>Company Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Summit Commercial Builders LLC"
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

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Years in Business *</Text>
          <TextInput
            style={styles.input}
            placeholder="12"
            placeholderTextColor="#94a3b8"
            value={yearsInBusiness}
            onChangeText={setYearsInBusiness}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Completed Projects</Text>
          <TextInput
            style={styles.input}
            placeholder="88"
            placeholderTextColor="#94a3b8"
            value={completedProjects}
            onChangeText={setCompletedProjects}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <Text style={styles.label}>Email Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="estimating@summitbuilders.com"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="(555) 321-0987"
        placeholderTextColor="#94a3b8"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Website (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="www.summitbuilders.com"
        placeholderTextColor="#94a3b8"
        value={website}
        onChangeText={setWebsite}
        autoCapitalize="none"
      />
    </View>
  );

  const renderProjectTypes = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏗️ Project Types & Scale</Text>

      <Text style={styles.label}>Commercial Project Types * (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(
          ['office', 'retail', 'warehouse', 'industrial', 'mixed-use', 'healthcare', 'government'] as CommercialProjectType[]
        ).map((projectType) => (
          <TouchableOpacity
            key={projectType}
            style={[
              styles.serviceChip,
              commercialProjectTypes.includes(projectType) && styles.serviceChipActive,
            ]}
            onPress={() => toggleCommercialProjectType(projectType)}
          >
            <Text
              style={[
                styles.serviceChipText,
                commercialProjectTypes.includes(projectType) && styles.serviceChipTextActive,
              ]}
            >
              {projectType.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Typical Project Scale * (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(['100k-500k', '500k-2m', '2m-10m', '10m-plus'] as ProjectScaleRange[]).map((scale) => (
          <TouchableOpacity
            key={scale}
            style={[styles.serviceChip, typicalProjectScales.includes(scale) && styles.serviceChipActive]}
            onPress={() => toggleProjectScale(scale)}
          >
            <Text style={[styles.serviceChipText, typicalProjectScales.includes(scale) && styles.serviceChipTextActive]}>
              ${scale.replace(/k/g, 'K').replace(/m/g, 'M').replace('-plus', '+').replace('-', ' - $')}
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

      <Text style={styles.label}>Active Bids in Progress</Text>
      <TextInput
        style={styles.input}
        placeholder="14"
        placeholderTextColor="#94a3b8"
        value={activeBids}
        onChangeText={setActiveBids}
        keyboardType="number-pad"
      />

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          📈 Higher-value commercial projects are prioritized based on scale alignment, bonding, and response capacity.
        </Text>
      </View>
    </View>
  );

  const renderCertifications = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📜 Licenses & Bonds</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          🏆 Complete licensing and bonding details improve trust scores for owners and developers reviewing your profile.
        </Text>
      </View>

      <Text style={styles.label}>License Number</Text>
      <TextInput
        style={styles.input}
        placeholder="B-1234567"
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

      <View style={styles.verificationNotice}>
        <Text style={styles.verificationText}>
          📋 Upload bid package qualifications, insurance certificates, and bond letters later from account settings.
        </Text>
      </View>
    </View>
  );

  const renderServiceArea = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📍 Service Area</Text>

      <Text style={styles.label}>Primary Market - City *</Text>
      <TextInput
        style={styles.input}
        placeholder="Dallas"
        placeholderTextColor="#94a3b8"
        value={city}
        onChangeText={setCity}
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            placeholder="TX"
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
            placeholder="75201"
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
        placeholder="50"
        placeholderTextColor="#94a3b8"
        value={serviceRadius}
        onChangeText={setServiceRadius}
        keyboardType="number-pad"
      />
      <Text style={styles.helperText}>
        Commercial opportunities inside this radius will be prioritized in your pipeline.
      </Text>

      <Text style={styles.label}>Additional ZIP Codes (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="75001, 75006, 75234"
        placeholderTextColor="#94a3b8"
        value={additionalZips}
        onChangeText={setAdditionalZips}
      />

      <Text style={styles.label}>Availability</Text>
      <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsAccepting(!isAccepting)}>
        <View style={[styles.checkbox, isAccepting && styles.checkboxChecked]}>
          {isAccepting && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Currently Accepting New Commercial Opportunities</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Maximum Projects Per Month</Text>
      <TextInput
        style={styles.input}
        placeholder="5"
        placeholderTextColor="#94a3b8"
        value={maxProjects}
        onChangeText={setMaxProjects}
        keyboardType="number-pad"
      />

      <View style={styles.matchingCard}>
        <Text style={styles.matchingTitle}>🤖 Commercial Matching Active</Text>
        <Text style={styles.matchingText}>
          Your company will be matched with commercial owners and developers based on project type, scale, bonding status, and market coverage.
        </Text>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'business':
        return renderBusinessInfo();
      case 'projects':
        return renderProjectTypes();
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
          {isInitialSetup ? 'Complete Your Commercial Builder Profile' : 'Edit Commercial Builder Profile'}
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
              <Text style={styles.saveButtonText}>💾 Save Commercial Builder Profile</Text>
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
  verificationNotice: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  verificationText: {
    fontSize: 13,
    color: '#a855f7',
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