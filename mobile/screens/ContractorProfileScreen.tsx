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
  ContractorProfile,
  ProjectCategory,
  ProjectType,
  ServiceType,
  ExperienceLevel,
  BudgetRange,
} from '../types/profiles';

interface ContractorProfileScreenProps {
  onBack: () => void;
  isInitialSetup?: boolean;
}

export default function ContractorProfileScreen({ onBack, isInitialSetup }: ContractorProfileScreenProps) {
  const [currentStep, setCurrentStep] = useState<'business' | 'services' | 'certifications' | 'area'>('business');
  
  // Business Info
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<'sole-proprietor' | 'llc' | 'corporation' | 'partnership'>('llc');
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [completedProjects, setCompletedProjects] = useState('');
  
  // Certifications
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [isInsured, setIsInsured] = useState(false);
  const [isBonded, setIsBonded] = useState(false);
  
  // Services
  const [categories, setCategories] = useState<ProjectCategory[]>(['residential']);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(['full-project']);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('intermediate');
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>(['standard-remodel']);
  
  // Service Area
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [serviceRadius, setServiceRadius] = useState('25');
  const [additionalZips, setAdditionalZips] = useState('');
  
  // Availability
  const [budgetRanges, setBudgetRanges] = useState<BudgetRange[]>(['15k-50k']);
  const [isAccepting, setIsAccepting] = useState(true);
  const [maxProjects, setMaxProjects] = useState('3');
  
  // Contact
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  const toggleCategory = (category: ProjectCategory) => {
    if (categories.includes(category)) {
      setCategories(categories.filter(c => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  const toggleServiceType = (service: ServiceType) => {
    if (serviceTypes.includes(service)) {
      setServiceTypes(serviceTypes.filter(s => s !== service));
    } else {
      setServiceTypes([...serviceTypes, service]);
    }
  };

  const toggleProjectType = (type: ProjectType) => {
    if (projectTypes.includes(type)) {
      setProjectTypes(projectTypes.filter(t => t !== type));
    } else {
      setProjectTypes([...projectTypes, type]);
    }
  };

  const toggleBudgetRange = (range: BudgetRange) => {
    if (budgetRanges.includes(range)) {
      setBudgetRanges(budgetRanges.filter(r => r !== range));
    } else {
      setBudgetRanges([...budgetRanges, range]);
    }
  };

  const handleSave = () => {
    // Validation
    if (!businessName || !email || !phone || !city || !state || !zipCode) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (categories.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one project category.');
      return;
    }

    if (serviceTypes.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one service type.');
      return;
    }

    // TODO: Save to backend
    Alert.alert(
      'Contractor Profile Saved',
      'Your profile has been updated and will be used for AI-powered project matching.',
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const renderBusinessInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏢 Business Information</Text>
      
      <Text style={styles.label}>Business Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Your Company Name LLC"
        placeholderTextColor="#94a3b8"
        value={businessName}
        onChangeText={setBusinessName}
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
              {type === 'sole-proprietor' ? 'Sole Proprietor' : 
               type === 'llc' ? 'LLC' :
               type === 'corporation' ? 'Corporation' : 'Partnership'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Years in Business *</Text>
          <TextInput
            style={styles.input}
            placeholder="5"
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
            placeholder="50"
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
        placeholder="business@example.com"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="(555) 123-4567"
        placeholderTextColor="#94a3b8"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Website (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="www.yourcompany.com"
        placeholderTextColor="#94a3b8"
        value={website}
        onChangeText={setWebsite}
        autoCapitalize="none"
      />
    </View>
  );

  const renderServices = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔨 Services & Specializations</Text>
      
      <Text style={styles.label}>Project Categories * (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(['residential', 'commercial', 'apartment', 'landscaping'] as ProjectCategory[]).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.serviceChip, categories.includes(cat) && styles.serviceChipActive]}
            onPress={() => toggleCategory(cat)}
          >
            <Text style={[styles.serviceChipText, categories.includes(cat) && styles.serviceChipTextActive]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Service Types * (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(['full-project', 'plumbing', 'roofing', 'electrical', 'hvac', 'painting', 'flooring', 'minor-repairs', 'handyman'] as ServiceType[]).map((service) => (
          <TouchableOpacity
            key={service}
            style={[styles.serviceChip, serviceTypes.includes(service) && styles.serviceChipActive]}
            onPress={() => toggleServiceType(service)}
          >
            <Text style={[styles.serviceChipText, serviceTypes.includes(service) && styles.serviceChipTextActive]}>
              {service.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Project Type Preferences</Text>
      <View style={styles.buttonGroup}>
        {(['standard-remodel', 'custom-job'] as ProjectType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.serviceChip, projectTypes.includes(type) && styles.serviceChipActive]}
            onPress={() => toggleProjectType(type)}
          >
            <Text style={[styles.serviceChipText, projectTypes.includes(type) && styles.serviceChipTextActive]}>
              {type === 'standard-remodel' ? 'Standard Remodel' : 'Custom Job'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Your Experience Level *</Text>
      <View style={styles.buttonGroup}>
        {(['entry-level', 'intermediate', 'expert', 'master-craftsman'] as ExperienceLevel[]).map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.optionButton, experienceLevel === level && styles.optionButtonActive]}
            onPress={() => setExperienceLevel(level)}
          >
            <Text style={[styles.optionText, experienceLevel === level && styles.optionTextActive]}>
              {level.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Typical Budget Ranges (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(['under-5k', '5k-15k', '15k-50k', '50k-100k', '100k-250k', '250k-500k', '500k-plus'] as BudgetRange[]).map((budget) => (
          <TouchableOpacity
            key={budget}
            style={[styles.serviceChip, budgetRanges.includes(budget) && styles.serviceChipActive]}
            onPress={() => toggleBudgetRange(budget)}
          >
            <Text style={[styles.serviceChipText, budgetRanges.includes(budget) && styles.serviceChipTextActive]}>
              ${budget.replace('k', 'K').replace('under-', '<').replace('-plus', '+')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCertifications = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📜 Licenses & Certifications</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          🏆 Complete certifications increase your match score and build trust with homeowners
        </Text>
      </View>

      <Text style={styles.label}>License Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., CA-123456"
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

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setIsInsured(!isInsured)}
      >
        <View style={[styles.checkbox, isInsured && styles.checkboxChecked]}>
          {isInsured && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Currently Insured</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setIsBonded(!isBonded)}
      >
        <View style={[styles.checkbox, isBonded && styles.checkboxChecked]}>
          {isBonded && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Currently Bonded</Text>
      </TouchableOpacity>

      <View style={styles.verificationNotice}>
        <Text style={styles.verificationText}>
          📋 Verification documents can be uploaded in your account settings
        </Text>
      </View>
    </View>
  );

  const renderServiceArea = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📍 Service Area</Text>
      
      <Text style={styles.label}>Primary Location - City *</Text>
      <TextInput
        style={styles.input}
        placeholder="Los Angeles"
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
            placeholder="90001"
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
        placeholder="25"
        placeholderTextColor="#94a3b8"
        value={serviceRadius}
        onChangeText={setServiceRadius}
        keyboardType="number-pad"
      />
      <Text style={styles.helperText}>
        Projects within this radius will be shown to you
      </Text>

      <Text style={styles.label}>Additional ZIP Codes (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="90002, 90003, 90004 (comma-separated)"
        placeholderTextColor="#94a3b8"
        value={additionalZips}
        onChangeText={setAdditionalZips}
      />

      <Text style={styles.label}>Availability</Text>
      
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setIsAccepting(!isAccepting)}
      >
        <View style={[styles.checkbox, isAccepting && styles.checkboxChecked]}>
          {isAccepting && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Currently Accepting New Projects</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Maximum Projects Per Month</Text>
      <TextInput
        style={styles.input}
        placeholder="3"
        placeholderTextColor="#94a3b8"
        value={maxProjects}
        onChangeText={setMaxProjects}
        keyboardType="number-pad"
      />

      <View style={styles.matchingCard}>
        <Text style={styles.matchingTitle}>🤖 AI Matching Active</Text>
        <Text style={styles.matchingText}>
          Based on your profile, you'll be matched with projects in your service area that match 
          your specializations, budget range, and availability.
        </Text>
      </View>
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
          {isInitialSetup ? 'Complete Your Contractor Profile' : 'Edit Contractor Profile'}
        </Text>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        {['business', 'services', 'certifications', 'area'].map((step, index) => (
          <React.Fragment key={step}>
            <TouchableOpacity
              style={[
                styles.stepDot,
                currentStep === step && styles.stepDotActive,
                ['business', 'services', 'certifications', 'area'].indexOf(currentStep) > index && styles.stepDotCompleted
              ]}
              onPress={() => setCurrentStep(step as any)}
            >
              <Text style={[
                styles.stepNumber,
                (currentStep === step || ['business', 'services', 'certifications', 'area'].indexOf(currentStep) > index) && styles.stepNumberActive
              ]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
            {index < 3 && <View style={styles.stepLine} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStepContent()}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {currentStep !== 'business' && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                const steps = ['business', 'services', 'certifications', 'area'];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1] as any);
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
                const steps = ['business', 'services', 'certifications', 'area'];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex < steps.length - 1) {
                  setCurrentStep(steps[currentIndex + 1] as any);
                }
              }}
            >
              <Text style={styles.primaryButtonText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>💾 Save Contractor Profile</Text>
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
    marginBottom: 16,
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
