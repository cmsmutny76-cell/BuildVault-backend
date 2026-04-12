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
  ConstructionProgram,
  ProgramLength,
  SchoolType,
} from '../types/profiles';

interface SchoolProfileScreenProps {
  onBack: () => void;
  isInitialSetup?: boolean;
}

type StepKey = 'school' | 'programs' | 'placement' | 'location';

const STEP_ORDER: StepKey[] = ['school', 'programs', 'placement', 'location'];

export default function SchoolProfileScreen({ onBack, isInitialSetup }: SchoolProfileScreenProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>('school');

  const [schoolName, setSchoolName] = useState('');
  const [schoolType, setSchoolType] = useState<SchoolType>('vocational-trade-school');
  const [isAccredited, setIsAccredited] = useState(false);
  const [enrollmentCapacity, setEnrollmentCapacity] = useState('');

  const [programsOffered, setProgramsOffered] = useState<ConstructionProgram[]>(['carpentry']);
  const [programLength, setProgramLength] = useState<ProgramLength>('months');

  const [jobPlacementAssistance, setJobPlacementAssistance] = useState(true);
  const [jobPlacementRate, setJobPlacementRate] = useState('');
  const [industryPartners, setIndustryPartners] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [servesRemoteStudents, setServesRemoteStudents] = useState(false);

  const toggleProgram = (program: ConstructionProgram) => {
    if (programsOffered.includes(program)) {
      setProgramsOffered(programsOffered.filter((item) => item !== program));
      return;
    }

    setProgramsOffered([...programsOffered, program]);
  };

  const handleSave = () => {
    if (!schoolName || !contactName || !email || !phone || !street || !city || !state || !zipCode) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (programsOffered.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one program offered.');
      return;
    }

    Alert.alert(
      'School Profile Saved',
      'Your school profile has been updated for career opportunity and employer partnership matching.',
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const renderSchoolInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏫 School Information</Text>

      <Text style={styles.label}>School Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="North Valley Trade Institute"
        placeholderTextColor="#94a3b8"
        value={schoolName}
        onChangeText={setSchoolName}
      />

      <Text style={styles.label}>School Type *</Text>
      <View style={styles.buttonGroup}>
        {(
          [
            'vocational-trade-school',
            'apprenticeship-program',
            'community-college-trade-department',
            'industry-training-center',
          ] as SchoolType[]
        ).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.optionButton, schoolType === type && styles.optionButtonActive]}
            onPress={() => setSchoolType(type)}
          >
            <Text style={[styles.optionText, schoolType === type && styles.optionTextActive]}>
              {type.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsAccredited(!isAccredited)}>
        <View style={[styles.checkbox, isAccredited && styles.checkboxChecked]}>
          {isAccredited && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Accredited Program</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Enrollment Capacity</Text>
      <TextInput
        style={styles.input}
        placeholder="240"
        placeholderTextColor="#94a3b8"
        value={enrollmentCapacity}
        onChangeText={setEnrollmentCapacity}
        keyboardType="number-pad"
      />
    </View>
  );

  const renderPrograms = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🧰 Programs Offered</Text>

      <Text style={styles.label}>Construction Programs * (Select all that apply)</Text>
      <View style={styles.buttonGroup}>
        {(
          [
            'carpentry',
            'electrical',
            'plumbing',
            'hvac',
            'welding',
            'masonry',
            'painting',
            'landscaping',
            'heavy-equipment',
            'construction-management',
          ] as ConstructionProgram[]
        ).map((program) => (
          <TouchableOpacity
            key={program}
            style={[styles.serviceChip, programsOffered.includes(program) && styles.serviceChipActive]}
            onPress={() => toggleProgram(program)}
          >
            <Text style={[styles.serviceChipText, programsOffered.includes(program) && styles.serviceChipTextActive]}>
              {program.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Typical Program Length *</Text>
      <View style={styles.buttonGroup}>
        {(['weeks', 'months', '1-2-years', '2-plus-years'] as ProgramLength[]).map((length) => (
          <TouchableOpacity
            key={length}
            style={[styles.optionButton, programLength === length && styles.optionButtonActive]}
            onPress={() => setProgramLength(length)}
          >
            <Text style={[styles.optionText, programLength === length && styles.optionTextActive]}>
              {length === '1-2-years'
                ? '1-2 Years'
                : length === '2-plus-years'
                  ? '2+ Years'
                  : length.charAt(0).toUpperCase() + length.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          🎯 Program details help match your school with employers looking for specific skilled trades and student pipelines.
        </Text>
      </View>
    </View>
  );

  const renderPlacement = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🤝 Hiring & Placement</Text>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setJobPlacementAssistance(!jobPlacementAssistance)}
      >
        <View style={[styles.checkbox, jobPlacementAssistance && styles.checkboxChecked]}>
          {jobPlacementAssistance && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Offers Job Placement Assistance</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Job Placement Rate (%)</Text>
      <TextInput
        style={styles.input}
        placeholder="86"
        placeholderTextColor="#94a3b8"
        value={jobPlacementRate}
        onChangeText={setJobPlacementRate}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Industry Partners</Text>
      <TextInput
        style={styles.input}
        placeholder="ABC Builders, Summit Electric, Evergreen Outdoor"
        placeholderTextColor="#94a3b8"
        value={industryPartners}
        onChangeText={setIndustryPartners}
        multiline
      />

      <Text style={styles.label}>Primary Contact Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Jordan Ellis"
        placeholderTextColor="#94a3b8"
        value={contactName}
        onChangeText={setContactName}
      />

      <Text style={styles.label}>Contact Email *</Text>
      <TextInput
        style={styles.input}
        placeholder="careers@northvalleytrade.edu"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Contact Phone *</Text>
      <TextInput
        style={styles.input}
        placeholder="(555) 441-8820"
        placeholderTextColor="#94a3b8"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <View style={styles.matchingCard}>
        <Text style={styles.matchingTitle}>🤖 Career Matching Active</Text>
        <Text style={styles.matchingText}>
          Employers in construction, landscaping, and trade services can be matched to your programs based on hiring demand and training focus.
        </Text>
      </View>
    </View>
  );

  const renderLocation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📍 Location</Text>

      <Text style={styles.label}>Street Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="1200 Industrial Way"
        placeholderTextColor="#94a3b8"
        value={street}
        onChangeText={setStreet}
      />

      <Text style={styles.label}>City *</Text>
      <TextInput
        style={styles.input}
        placeholder="Bakersfield"
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
            placeholder="93301"
            placeholderTextColor="#94a3b8"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setServesRemoteStudents(!servesRemoteStudents)}
      >
        <View style={[styles.checkbox, servesRemoteStudents && styles.checkboxChecked]}>
          {servesRemoteStudents && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Serves Remote or Hybrid Students</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'school':
        return renderSchoolInfo();
      case 'programs':
        return renderPrograms();
      case 'placement':
        return renderPlacement();
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
          {isInitialSetup ? 'Complete Your School Profile' : 'Edit School Profile'}
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
          {currentStep !== 'school' && (
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
              <Text style={styles.saveButtonText}>💾 Save School Profile</Text>
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