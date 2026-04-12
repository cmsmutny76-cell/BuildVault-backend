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
  BusinessEntityType,
  DevelopmentStage,
  DevelopmentType,
  FinancingSource,
  PortfolioValueRange,
} from '../types/profiles';

interface DeveloperProfileScreenProps {
  onBack: () => void;
  isInitialSetup?: boolean;
}

type StepKey = 'organization' | 'focus' | 'portfolio' | 'location';

const STEP_ORDER: StepKey[] = ['organization', 'focus', 'portfolio', 'location'];

export default function DeveloperProfileScreen({
  onBack,
  isInitialSetup,
}: DeveloperProfileScreenProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>('organization');

  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessEntityType>('llc');
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  const [developmentTypes, setDevelopmentTypes] = useState<DevelopmentType[]>(['mixed-use']);
  const [developmentStages, setDevelopmentStages] = useState<DevelopmentStage[]>(['pre-development']);

  const [portfolioValueRange, setPortfolioValueRange] = useState<PortfolioValueRange>('10m-50m');
  const [activeProjectCount, setActiveProjectCount] = useState('');
  const [completedDevelopments, setCompletedDevelopments] = useState('');
  const [financingSources, setFinancingSources] = useState<FinancingSource[]>(['construction-loan']);
  const [maxProjects, setMaxProjects] = useState('3');

  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [serviceRadius, setServiceRadius] = useState('75');
  const [additionalMarkets, setAdditionalMarkets] = useState('');

  const toggleDevelopmentType = (developmentType: DevelopmentType) => {
    if (developmentTypes.includes(developmentType)) {
      setDevelopmentTypes(developmentTypes.filter((item) => item !== developmentType));
      return;
    }

    setDevelopmentTypes([...developmentTypes, developmentType]);
  };

  const toggleDevelopmentStage = (developmentStage: DevelopmentStage) => {
    if (developmentStages.includes(developmentStage)) {
      setDevelopmentStages(developmentStages.filter((item) => item !== developmentStage));
      return;
    }

    setDevelopmentStages([...developmentStages, developmentStage]);
  };

  const toggleFinancingSource = (source: FinancingSource) => {
    if (financingSources.includes(source)) {
      setFinancingSources(financingSources.filter((item) => item !== source));
      return;
    }

    setFinancingSources([...financingSources, source]);
  };

  const handleSave = () => {
    if (!companyName || !email || !phone || !city || !state || !zipCode) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (developmentTypes.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one development type.');
      return;
    }

    if (developmentStages.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one development stage.');
      return;
    }

    Alert.alert(
      'Developer Profile Saved',
      'Your developer profile has been updated for project and capital stack matching.',
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const renderOrganization = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏗️ Organization</Text>

      <Text style={styles.label}>Development Company *</Text>
      <TextInput
        style={styles.input}
        placeholder="Harbor Point Development Group"
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

      <Text style={styles.label}>Years in Development *</Text>
      <TextInput
        style={styles.input}
        placeholder="14"
        placeholderTextColor="#94a3b8"
        value={yearsInBusiness}
        onChangeText={setYearsInBusiness}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Email Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="pipeline@harborpointdev.com"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="(555) 602-1133"
        placeholderTextColor="#94a3b8"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Website (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="www.harborpointdev.com"
        placeholderTextColor="#94a3b8"
        value={website}
        onChangeText={setWebsite}
        autoCapitalize="none"
      />
    </View>
  );

  const renderFocus = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📐 Development Focus</Text>

      <Text style={styles.label}>Development Types * (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(
          ['residential', 'commercial', 'mixed-use', 'industrial', 'land-development', 'adaptive-reuse'] as DevelopmentType[]
        ).map((developmentType) => (
          <TouchableOpacity
            key={developmentType}
            style={[styles.serviceChip, developmentTypes.includes(developmentType) && styles.serviceChipActive]}
            onPress={() => toggleDevelopmentType(developmentType)}
          >
            <Text style={[styles.serviceChipText, developmentTypes.includes(developmentType) && styles.serviceChipTextActive]}>
              {developmentType.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Current Project Stages * (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(['pre-development', 'under-construction', 'stabilized', 'value-add'] as DevelopmentStage[]).map((stage) => (
          <TouchableOpacity
            key={stage}
            style={[styles.serviceChip, developmentStages.includes(stage) && styles.serviceChipActive]}
            onPress={() => toggleDevelopmentStage(stage)}
          >
            <Text style={[styles.serviceChipText, developmentStages.includes(stage) && styles.serviceChipTextActive]}>
              {stage.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          📈 Project stage data helps prioritize the right contractors and consultants based on where each development sits in the pipeline.
        </Text>
      </View>
    </View>
  );

  const renderPortfolio = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💼 Portfolio</Text>

      <Text style={styles.label}>Portfolio Value Range *</Text>
      <View style={styles.buttonGroup}>
        {(['1m-10m', '10m-50m', '50m-100m', '100m-plus'] as PortfolioValueRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.optionButton, portfolioValueRange === range && styles.optionButtonActive]}
            onPress={() => setPortfolioValueRange(range)}
          >
            <Text style={[styles.optionText, portfolioValueRange === range && styles.optionTextActive]}>
              ${range.replace(/m/g, 'M').replace('-plus', '+').replace('-', ' - $')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Active Projects</Text>
          <TextInput
            style={styles.input}
            placeholder="7"
            placeholderTextColor="#94a3b8"
            value={activeProjectCount}
            onChangeText={setActiveProjectCount}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Completed Developments</Text>
          <TextInput
            style={styles.input}
            placeholder="24"
            placeholderTextColor="#94a3b8"
            value={completedDevelopments}
            onChangeText={setCompletedDevelopments}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <Text style={styles.label}>Financing Sources (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(['private-equity', 'construction-loan', 'cmbs', 'self-financed'] as FinancingSource[]).map((source) => (
          <TouchableOpacity
            key={source}
            style={[styles.serviceChip, financingSources.includes(source) && styles.serviceChipActive]}
            onPress={() => toggleFinancingSource(source)}
          >
            <Text style={[styles.serviceChipText, financingSources.includes(source) && styles.serviceChipTextActive]}>
              {source === 'cmbs' ? 'CMBS' : source.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Maximum Active Deals to Source Per Month</Text>
      <TextInput
        style={styles.input}
        placeholder="3"
        placeholderTextColor="#94a3b8"
        value={maxProjects}
        onChangeText={setMaxProjects}
        keyboardType="number-pad"
      />

      <View style={styles.matchingCard}>
        <Text style={styles.matchingTitle}>🤖 Development Matching Active</Text>
        <Text style={styles.matchingText}>
          Matching will factor in deal stage, project type, capital structure, and portfolio scale when ranking contractors and project partners.
        </Text>
      </View>
    </View>
  );

  const renderLocation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📍 Primary Market</Text>

      <Text style={styles.label}>Market City *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nashville"
        placeholderTextColor="#94a3b8"
        value={city}
        onChangeText={setCity}
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            placeholder="TN"
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
            placeholder="37203"
            placeholderTextColor="#94a3b8"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>
      </View>

      <Text style={styles.label}>Market Radius (miles) *</Text>
      <TextInput
        style={styles.input}
        placeholder="75"
        placeholderTextColor="#94a3b8"
        value={serviceRadius}
        onChangeText={setServiceRadius}
        keyboardType="number-pad"
      />
      <Text style={styles.helperText}>
        Use this to prioritize partners and contractors with a real operating footprint in your target market.
      </Text>

      <Text style={styles.label}>Additional Markets (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Franklin, Murfreesboro, Hendersonville"
        placeholderTextColor="#94a3b8"
        value={additionalMarkets}
        onChangeText={setAdditionalMarkets}
      />
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'organization':
        return renderOrganization();
      case 'focus':
        return renderFocus();
      case 'portfolio':
        return renderPortfolio();
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
          {isInitialSetup ? 'Complete Your Developer Profile' : 'Edit Developer Profile'}
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
              <Text style={styles.saveButtonText}>💾 Save Developer Profile</Text>
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