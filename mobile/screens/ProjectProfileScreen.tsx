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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import ServiceSelectionScreen from './ServiceSelectionScreen';
import {
  ProjectProfile,
  ProjectCategory,
  ProjectType,
  ServiceType,
  ExperienceLevel,
  BudgetRange,
} from '../types/profiles';

interface ProjectProfileScreenProps {
  onBack: () => void;
  projectId?: string; // If editing existing project
}

export default function ProjectProfileScreen({ onBack, projectId }: ProjectProfileScreenProps) {
  const [currentStep, setCurrentStep] = useState<'basic' | 'details' | 'requirements' | 'considerations' | 'contact'>('basic');
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('residential');
  const [projectType, setProjectType] = useState<ProjectType>('standard-remodel');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number>(50000);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('intermediate');
  const [projectPhotos, setProjectPhotos] = useState<string[]>([]);
  
  // New AI Matching Fields
  const [projectScale, setProjectScale] = useState<'small-repair' | 'medium-remodel' | 'large-renovation' | 'new-construction'>('medium-remodel');
  const [propertyType, setPropertyType] = useState<'single-family' | 'condo-townhouse' | 'multi-family' | 'commercial' | 'industrial'>('single-family');
  const [propertySize, setPropertySize] = useState('');
  const [propertyAge, setPropertyAge] = useState<'new' | '0-10' | '10-30' | '30-50' | '50+'>('10-30');
  const [propertyOccupied, setPropertyOccupied] = useState(true);
  const [urgencyLevel, setUrgencyLevel] = useState<'emergency' | 'asap' | '1-month' | '3-months' | '6-months' | 'flexible'>('flexible');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [timelineFlexible, setTimelineFlexible] = useState(true);
  const [requiresLicensed, setRequiresLicensed] = useState(true);
  const [requiresInsured, setRequiresInsured] = useState(true);
  const [requiresBonded, setRequiresBonded] = useState(false);
  
  // Location
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Contact
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [additionalPhones, setAdditionalPhones] = useState<string[]>([]);
  
  // Special Considerations
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [hasPermits, setHasPermits] = useState(false);
  const [hasHOA, setHasHOA] = useState(false);
  const [hoaRestrictions, setHoaRestrictions] = useState('');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState('');
  const [workHourRestrictions, setWorkHourRestrictions] = useState('');
  const [parkingAccess, setParkingAccess] = useState('');
  const [noiseRestrictions, setNoiseRestrictions] = useState(false);
  const [debrisRemoval, setDebrisRemoval] = useState<'contractor' | 'homeowner' | 'discuss'>('contractor');
  
  // Communication Preferences
  const [preferredContactMethod, setPreferredContactMethod] = useState<'email' | 'phone' | 'text' | 'any'>('any');
  const [bestTimeToContact, setBestTimeToContact] = useState('');
  const [responseTimeExpectation, setResponseTimeExpectation] = useState<'immediate' | 'same-day' | 'within-24hrs' | 'flexible'>('flexible');
  const [preferredMeetingType, setPreferredMeetingType] = useState<'in-person' | 'virtual' | 'either'>('either');

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map(asset => asset.uri);
      setProjectPhotos([...projectPhotos, ...newPhotos]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setProjectPhotos([...projectPhotos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setProjectPhotos(projectPhotos.filter((_, i) => i !== index));
  };

  const addAdditionalEmail = () => {
    setAdditionalEmails([...additionalEmails, '']);
  };

  const removeAdditionalEmail = (index: number) => {
    setAdditionalEmails(additionalEmails.filter((_, i) => i !== index));
  };

  const updateAdditionalEmail = (index: number, value: string) => {
    const updated = [...additionalEmails];
    updated[index] = value;
    setAdditionalEmails(updated);
  };

  const addAdditionalPhone = () => {
    setAdditionalPhones([...additionalPhones, '']);
  };

  const removeAdditionalPhone = (index: number) => {
    setAdditionalPhones(additionalPhones.filter((_, i) => i !== index));
  };

  const updateAdditionalPhone = (index: number, value: string) => {
    const updated = [...additionalPhones];
    updated[index] = value;
    setAdditionalPhones(updated);
  };

  const handleAIGenerateDescription = () => {
    setShowAIHelper(true);
    // Simulate AI generation
    setTimeout(() => {
      const formattedBudget = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(budget);
      const servicesText = selectedServices.length > 0 ? selectedServices.join(', ') : 'various services';
      const aiOutline = `Project Overview:\n${title}\n\nScope of Work:\n- Detailed assessment of ${category} project requirements\n- Services needed: ${servicesText}\n- Professional ${projectType === 'custom-job' ? 'custom design and build' : 'standard remodel'} execution\n- Quality materials and craftsmanship\n- Timeline management and scheduling\n- Final walkthrough and approval\n\nExpected Outcomes:\n- High-quality ${category} project completion\n- Code-compliant installation\n- Clean job site\n- Warranty coverage\n\nSpecial Considerations:\n- Budget: ${formattedBudget}\n- Experience level required: ${experienceLevel}\n- Licensed contractor: ${requiresLicensed ? 'Required' : 'Not required'}`;
      
      setDescription(aiOutline);
      setShowAIHelper(false);
      Alert.alert('AI Assistant', 'Description generated! You can edit it as needed.');
    }, 1500);
  };

  const handleSave = () => {
    // Validation
    if (!title || !street || !city || !state || !zipCode || !contactName || !email || !phone) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // TODO: Save to backend
    Alert.alert(
      'Project Profile Saved',
      'Your project profile has been created and is now visible to matching contractors.',
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📋 Basic Information</Text>
      
      <Text style={styles.label}>Project Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Kitchen Remodel, New Deck Installation"
        placeholderTextColor="#94a3b8"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Project Type *</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.optionButton, projectType === 'standard-remodel' && styles.optionButtonActive]}
          onPress={() => setProjectType('standard-remodel')}
        >
          <Text style={[styles.optionText, projectType === 'standard-remodel' && styles.optionTextActive]}>
            Standard Remodel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, projectType === 'custom-job' && styles.optionButtonActive]}
          onPress={() => setProjectType('custom-job')}
        >
          <Text style={[styles.optionText, projectType === 'custom-job' && styles.optionTextActive]}>
            Custom Job
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Project Scale *</Text>
      <View style={styles.buttonGroup}>
        {([
          { value: 'small-repair', label: 'Small Repair' },
          { value: 'medium-remodel', label: 'Medium Remodel' },
          { value: 'large-renovation', label: 'Large Renovation' },
          { value: 'new-construction', label: 'New Construction' }
        ] as Array<{ value: 'small-repair' | 'medium-remodel' | 'large-renovation' | 'new-construction', label: string }>).map((scale) => (
          <TouchableOpacity
            key={scale.value}
            style={[styles.optionButton, projectScale === scale.value && styles.optionButtonActive]}
            onPress={() => setProjectScale(scale.value)}
          >
            <Text style={[styles.optionText, projectScale === scale.value && styles.optionTextActive]}>
              {scale.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Services Needed *</Text>
      
      {selectedServices.length > 0 && (
        <View style={styles.selectedServicesContainer}>
          {selectedServices.map((service, index) => (
            <View key={index} style={styles.selectedServiceChip}>
              <Text style={styles.selectedServiceText}>{service}</Text>
              <TouchableOpacity 
                onPress={() => setSelectedServices(selectedServices.filter(s => s !== service))}
                style={styles.removeServiceButton}
              >
                <Text style={styles.removeServiceText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.addServiceButton}
          onPress={() => setShowServiceSelection(true)}
        >
          <Text style={styles.addServiceIcon}>➕</Text>
          <Text style={styles.addServiceText}>
            {selectedServices.length > 0 ? 'Add More Services' : 'Add Services'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProjectDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📝 Project Details</Text>
      
      <View style={styles.aiHelperCard}>
        <Text style={styles.aiHelperTitle}>✨ AI-Powered Description</Text>
        <Text style={styles.aiHelperDescription}>
          Let AI generate a detailed project outline based on your inputs
        </Text>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={handleAIGenerateDescription}
          disabled={showAIHelper || !title}
        >
          <Text style={styles.aiButtonText}>
            {showAIHelper ? '✨ Generating...' : '✨ Generate Description with AI'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Project Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe your project in detail... Include scope, timeline, special requirements, etc."
        placeholderTextColor="#94a3b8"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={8}
        textAlignVertical="top"
      />

      <Text style={styles.helperText}>
        💡 Tip: Include project scope, materials, timeline, and any special requirements
      </Text>
    </View>
  );

  const renderPropertyDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏘️ Property Details</Text>
      
      <Text style={styles.label}>Property Type *</Text>
      <View style={styles.buttonGroup}>
        {([
          { value: 'single-family', label: 'Single Family' },
          { value: 'condo-townhouse', label: 'Condo/Townhouse' },
          { value: 'multi-family', label: 'Multi-Family' },
          { value: 'commercial', label: 'Commercial' },
          { value: 'industrial', label: 'Industrial' }
        ] as Array<{ value: 'single-family' | 'condo-townhouse' | 'multi-family' | 'commercial' | 'industrial', label: string }>).map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[styles.optionButton, propertyType === type.value && styles.optionButtonActive]}
            onPress={() => setPropertyType(type.value)}
          >
            <Text style={[styles.optionText, propertyType === type.value && styles.optionTextActive]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Property Size (sq ft)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 2000"
        placeholderTextColor="#94a3b8"
        value={propertySize}
        onChangeText={setPropertySize}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Property Age *</Text>
      <View style={styles.buttonGroup}>
        {([
          { value: 'new', label: 'New' },
          { value: '0-10', label: '0-10 years' },
          { value: '10-30', label: '10-30 years' },
          { value: '30-50', label: '30-50 years' },
          { value: '50+', label: '50+ years' }
        ] as Array<{ value: 'new' | '0-10' | '10-30' | '30-50' | '50+', label: string }>).map((age) => (
          <TouchableOpacity
            key={age.value}
            style={[styles.optionButton, propertyAge === age.value && styles.optionButtonActive]}
            onPress={() => setPropertyAge(age.value)}
          >
            <Text style={[styles.optionText, propertyAge === age.value && styles.optionTextActive]}>
              {age.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setPropertyOccupied(!propertyOccupied)}
      >
        <View style={[styles.checkbox, propertyOccupied && styles.checkboxChecked]}>
          {propertyOccupied && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Property is Currently Occupied</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBudget = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💰 Budget</Text>
      
      <View style={styles.budgetContainer}>
        <Text style={styles.label}>Budget *</Text>
        <Text style={styles.budgetValue}>
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(budget)}
        </Text>
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10000000}
          step={5000}
          value={budget}
          onValueChange={setBudget}
          minimumTrackTintColor="#D4AF37"
          maximumTrackTintColor="#475569"
          thumbTintColor="#D4AF37"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>$0</Text>
          <Text style={styles.sliderLabel}>$10M</Text>
        </View>
      </View>
    </View>
  );

  const renderTimeline = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⏰ Project Timeline</Text>
      
      <Text style={styles.label}>Urgency Level *</Text>
      <View style={styles.buttonGroup}>
        {([
          { value: 'emergency', label: '🚨 Emergency' },
          { value: 'asap', label: 'ASAP' },
          { value: '1-month', label: 'Within 1 Month' },
          { value: '3-months', label: 'Within 3 Months' },
          { value: '6-months', label: 'Within 6 Months' },
          { value: 'flexible', label: 'Flexible' }
        ] as Array<{ value: 'emergency' | 'asap' | '1-month' | '3-months' | '6-months' | 'flexible', label: string }>).map((urgency) => (
          <TouchableOpacity
            key={urgency.value}
            style={[styles.optionButton, urgencyLevel === urgency.value && styles.optionButtonActive]}
            onPress={() => setUrgencyLevel(urgency.value)}
          >
            <Text style={[styles.optionText, urgencyLevel === urgency.value && styles.optionTextActive]}>
              {urgency.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Desired Start Date</Text>
      <TextInput
        style={styles.input}
        placeholder="MM/DD/YYYY or 'Flexible'"
        placeholderTextColor="#94a3b8"
        value={startDate}
        onChangeText={setStartDate}
      />

      <Text style={styles.label}>Target Completion Date</Text>
      <TextInput
        style={styles.input}
        placeholder="MM/DD/YYYY or 'Flexible'"
        placeholderTextColor="#94a3b8"
        value={completionDate}
        onChangeText={setCompletionDate}
      />

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setTimelineFlexible(!timelineFlexible)}
      >
        <View style={[styles.checkbox, timelineFlexible && styles.checkboxChecked]}>
          {timelineFlexible && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Timeline is Flexible</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContractorRequirements = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚙️ Contractor Requirements</Text>
      
      <Text style={styles.label}>Required Certifications</Text>
      
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setRequiresLicensed(!requiresLicensed)}
      >
        <View style={[styles.checkbox, requiresLicensed && styles.checkboxChecked]}>
          {requiresLicensed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Must be Licensed</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setRequiresInsured(!requiresInsured)}
      >
        <View style={[styles.checkbox, requiresInsured && styles.checkboxChecked]}>
          {requiresInsured && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Must be Insured</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setRequiresBonded(!requiresBonded)}
      >
        <View style={[styles.checkbox, requiresBonded && styles.checkboxChecked]}>
          {requiresBonded && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Must be Bonded</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConsiderations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔍 Special Considerations</Text>
      
      <Text style={styles.label}>Special Requirements or Requests</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Any unique needs, preferences, or special circumstances..."
        placeholderTextColor="#94a3b8"
        value={specialRequirements}
        onChangeText={setSpecialRequirements}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Permits & Approvals</Text>
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setHasPermits(!hasPermits)}
      >
        <View style={[styles.checkbox, hasPermits && styles.checkboxChecked]}>
          {hasPermits && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Permits Already Obtained</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setHasHOA(!hasHOA)}
      >
        <View style={[styles.checkbox, hasHOA && styles.checkboxChecked]}>
          {hasHOA && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>HOA Approval Required</Text>
      </TouchableOpacity>

      {hasHOA && (
        <>
          <Text style={styles.label}>HOA Restrictions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe any HOA rules or restrictions..."
            placeholderTextColor="#94a3b8"
            value={hoaRestrictions}
            onChangeText={setHoaRestrictions}
            multiline
            numberOfLines={3}
          />
        </>
      )}

      <Text style={styles.label}>Work Environment</Text>
      
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setNoiseRestrictions(!noiseRestrictions)}
      >
        <View style={[styles.checkbox, noiseRestrictions && styles.checkboxChecked]}>
          {noiseRestrictions && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Noise Restrictions Apply</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Work Hours / Scheduling Notes</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Weekends only, After 5pm, etc."
        placeholderTextColor="#94a3b8"
        value={workHourRestrictions}
        onChangeText={setWorkHourRestrictions}
      />

      <Text style={styles.label}>Parking & Site Access</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe parking availability and site access..."
        placeholderTextColor="#94a3b8"
        value={parkingAccess}
        onChangeText={setParkingAccess}
      />

      <Text style={styles.label}>Accessibility Needs</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Any accessibility considerations for contractors..."
        placeholderTextColor="#94a3b8"
        value={accessibilityNeeds}
        onChangeText={setAccessibilityNeeds}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Debris & Waste Removal *</Text>
      <View style={styles.buttonGroup}>
        {([
          { value: 'contractor', label: 'Contractor Handles' },
          { value: 'homeowner', label: 'I Will Handle' },
          { value: 'discuss', label: 'Need to Discuss' }
        ] as Array<{ value: 'contractor' | 'homeowner' | 'discuss', label: string }>).map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.optionButton, debrisRemoval === option.value && styles.optionButtonActive]}
            onPress={() => setDebrisRemoval(option.value)}
          >
            <Text style={[styles.optionText, debrisRemoval === option.value && styles.optionTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLocation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📍 Project Location</Text>
      
      <View style={styles.mapNotice}>
        <Text style={styles.mapNoticeText}>
          🔒 Map location is only visible to contractors with paid subscriptions
        </Text>
      </View>

      <Text style={styles.label}>Street Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="123 Main Street"
        placeholderTextColor="#94a3b8"
        value={street}
        onChangeText={setStreet}
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor="#94a3b8"
            value={city}
            onChangeText={setCity}
          />
        </View>
        <View style={styles.quarterWidth}>
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
        <View style={styles.quarterWidth}>
          <Text style={styles.label}>ZIP *</Text>
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
    </View>
  );

  const renderRequirements = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📸 Project Photos</Text>
      
      <Text style={styles.helperText}>Upload photos to help contractors understand your project better</Text>
      
      {projectPhotos.length > 0 && (
        <ScrollView horizontal style={styles.photoPreviewContainer} showsHorizontalScrollIndicator={false}>
          {projectPhotos.map((photo, index) => (
            <View key={index} style={styles.photoPreviewWrapper}>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removePhoto(index)}
              >
                <Text style={styles.removePhotoText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      
      <View style={styles.uploadButtonsContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
          <Text style={styles.uploadIcon}>📁</Text>
          <Text style={styles.uploadButtonText}>Choose Photos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
          <Text style={styles.uploadIcon}>📷</Text>
          <Text style={styles.uploadButtonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.dragDropArea}>
        <Text style={styles.dragDropIcon}>🖼️</Text>
        <Text style={styles.dragDropText}>Drag & Drop Photos Here</Text>
        <Text style={styles.dragDropSubtext}>or tap "Choose Photos" above</Text>
      </View>
      
      <Text style={styles.photoTip}>💡 Tip: Add multiple photos showing different angles and areas of your project</Text>
    </View>
  );

  const renderCommunicationPreferences = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💬 Communication Preferences</Text>
      
      <Text style={styles.label}>Preferred Contact Method *</Text>
      <View style={styles.buttonGroup}>
        {([
          { value: 'email', label: '📧 Email' },
          { value: 'phone', label: '📞 Phone Call' },
          { value: 'text', label: '💬 Text Message' },
          { value: 'any', label: 'Any Method' }
        ] as Array<{ value: 'email' | 'phone' | 'text' | 'any', label: string }>).map((method) => (
          <TouchableOpacity
            key={method.value}
            style={[styles.optionButton, preferredContactMethod === method.value && styles.optionButtonActive]}
            onPress={() => setPreferredContactMethod(method.value)}
          >
            <Text style={[styles.optionText, preferredContactMethod === method.value && styles.optionTextActive]}>
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Best Time to Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Weekday mornings, After 6pm, etc."
        placeholderTextColor="#94a3b8"
        value={bestTimeToContact}
        onChangeText={setBestTimeToContact}
      />

      <Text style={styles.label}>Response Time Expectation *</Text>
      <View style={styles.buttonGroup}>
        {([
          { value: 'immediate', label: 'Immediate' },
          { value: 'same-day', label: 'Same Day' },
          { value: 'within-24hrs', label: 'Within 24 Hours' },
          { value: 'flexible', label: 'Flexible' }
        ] as Array<{ value: 'immediate' | 'same-day' | 'within-24hrs' | 'flexible', label: string }>).map((expectation) => (
          <TouchableOpacity
            key={expectation.value}
            style={[styles.optionButton, responseTimeExpectation === expectation.value && styles.optionButtonActive]}
            onPress={() => setResponseTimeExpectation(expectation.value)}
          >
            <Text style={[styles.optionText, responseTimeExpectation === expectation.value && styles.optionTextActive]}>
              {expectation.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Preferred Meeting Type *</Text>
      <View style={styles.buttonGroup}>
        {([
          { value: 'in-person', label: 'In-Person' },
          { value: 'virtual', label: 'Virtual (Video Call)' },
          { value: 'either', label: 'Either Works' }
        ] as Array<{ value: 'in-person' | 'virtual' | 'either', label: string }>).map((meeting) => (
          <TouchableOpacity
            key={meeting.value}
            style={[styles.optionButton, preferredMeetingType === meeting.value && styles.optionButtonActive]}
            onPress={() => setPreferredMeetingType(meeting.value)}
          >
            <Text style={[styles.optionText, preferredMeetingType === meeting.value && styles.optionTextActive]}>
              {meeting.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderContactInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📞 Contact Information</Text>
      
      <Text style={styles.label}>Contact Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Your full name"
        placeholderTextColor="#94a3b8"
        value={contactName}
        onChangeText={setContactName}
      />

      <Text style={styles.label}>Email Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="email@example.com"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {additionalEmails.map((additionalEmail, index) => (
        <View key={index} style={styles.additionalContactRow}>
          <TextInput
            style={[styles.input, styles.additionalInput]}
            placeholder="Additional email address"
            placeholderTextColor="#94a3b8"
            value={additionalEmail}
            onChangeText={(value) => updateAdditionalEmail(index, value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.removeContactButton}
            onPress={() => removeAdditionalEmail(index)}
          >
            <Text style={styles.removeContactText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addContactTile} onPress={addAdditionalEmail}>
        <Text style={styles.addContactIcon}>➕</Text>
        <Text style={styles.addContactText}>Add Additional Email</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="(555) 123-4567"
        placeholderTextColor="#94a3b8"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {additionalPhones.map((additionalPhone, index) => (
        <View key={index} style={styles.additionalContactRow}>
          <TextInput
            style={[styles.input, styles.additionalInput]}
            placeholder="Additional phone number"
            placeholderTextColor="#94a3b8"
            value={additionalPhone}
            onChangeText={(value) => updateAdditionalPhone(index, value)}
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            style={styles.removeContactButton}
            onPress={() => removeAdditionalPhone(index)}
          >
            <Text style={styles.removeContactText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addContactTile} onPress={addAdditionalPhone}>
        <Text style={styles.addContactIcon}>➕</Text>
        <Text style={styles.addContactText}>Add Additional Phone</Text>
      </TouchableOpacity>

      <View style={styles.privacyNotice}>
        <Text style={styles.privacyText}>
          🔒 Your contact information is only shared with contractors you choose to connect with
        </Text>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return renderBasicInfo();
      case 'details':
        return (
          <>
            {renderPropertyDetails()}
            {renderLocation()}
          </>
        );
      case 'requirements':
        return (
          <>
            {renderBudget()}
            {renderTimeline()}
            {renderProjectDetails()}
          </>
        );
      case 'considerations':
        return (
          <>
            {renderRequirements()}
            {renderConsiderations()}
            {renderContractorRequirements()}
          </>
        );
      case 'contact':
        return (
          <>
            {renderContactInfo()}
            {renderCommunicationPreferences()}
          </>
        );
      default:
        return null;
    }
  };

  // Show service selection screen if open
  if (showServiceSelection) {
    return (
      <ServiceSelectionScreen
        onBack={(services) => {
          setSelectedServices(services);
          setShowServiceSelection(false);
        }}
        initialSelectedServices={selectedServices}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {projectId ? 'Edit Project Profile' : 'Create Project Profile'}
        </Text>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        {['basic', 'details', 'requirements', 'considerations', 'contact'].map((step, index) => (
          <React.Fragment key={step}>
            <TouchableOpacity
              style={[
                styles.stepDot,
                currentStep === step && styles.stepDotActive,
                ['basic', 'details', 'requirements', 'considerations', 'contact'].indexOf(currentStep) > index && styles.stepDotCompleted
              ]}
              onPress={() => setCurrentStep(step as any)}
            >
              <Text style={[
                styles.stepNumber,
                (currentStep === step || ['basic', 'details', 'requirements', 'considerations', 'contact'].indexOf(currentStep) > index) && styles.stepNumberActive
              ]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
            {index < 4 && <View style={styles.stepLine} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStepContent()}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {currentStep !== 'basic' && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                const steps = ['basic', 'details', 'requirements', 'considerations', 'contact'];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1] as any);
                }
              }}
            >
              <Text style={styles.secondaryButtonText}>← Previous</Text>
            </TouchableOpacity>
          )}

          {currentStep !== 'contact' ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                const steps = ['basic', 'details', 'requirements', 'considerations', 'contact'];
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
              <Text style={styles.saveButtonText}>💾 Save Project Profile</Text>
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
  textArea: {
    minHeight: 120,
    paddingTop: 16,
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
  aiHelperCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  aiHelperTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  aiHelperDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 12,
  },
  aiButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  aiButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  mapNotice: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  mapNoticeText: {
    fontSize: 13,
    color: '#3b82f6',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 2,
  },
  quarterWidth: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  privacyNotice: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  privacyText: {
    fontSize: 13,
    color: '#22c55e',
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
  budgetContainer: {
    marginBottom: 8,
  },
  budgetValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#D4AF37',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  sliderContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  selectedServicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  selectedServiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: '#D4AF37',
    gap: 8,
  },
  selectedServiceText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  removeServiceButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeServiceText: {
    fontSize: 10,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D4AF37',
    gap: 8,
  },
  addServiceIcon: {
    fontSize: 16,
    color: '#D4AF37',
  },
  addServiceText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  photoUploadSection: {
    marginBottom: 24,
  },
  photoPreviewContainer: {
    marginVertical: 16,
  },
  photoPreviewWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  removePhotoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  uploadButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  uploadIcon: {
    fontSize: 20,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  dragDropArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D4AF37',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  dragDropIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  dragDropText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 4,
  },
  dragDropSubtext: {
    fontSize: 13,
    color: '#94a3b8',
  },
  photoTip: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 16,
    fontStyle: 'italic',
  },
  additionalContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  additionalInput: {
    flex: 1,
  },
  removeContactButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeContactText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addContactTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#3b82f6',
    gap: 8,
    marginTop: 12,
  },
  addContactIcon: {
    fontSize: 16,
    color: '#3b82f6',
  },
  addContactText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
});
