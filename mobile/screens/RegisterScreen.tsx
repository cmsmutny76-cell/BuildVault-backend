import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import type { MobileUserType } from '../services/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

type AccountOption = {
  userType: MobileUserType;
  label: string;
  description: string;
  priceLabel: string;
  priceValue: number;
  group: 'free' | 'pro49' | 'pro99';
};

const ACCOUNT_OPTIONS: AccountOption[] = [
  {
    userType: 'homeowner',
    label: 'Homeowner',
    description: 'I need construction work done',
    priceLabel: 'Free',
    priceValue: 0,
    group: 'free',
  },
  {
    userType: 'employment_seeker',
    label: 'Employment Seeker',
    description: 'I am looking for work opportunities',
    priceLabel: 'Free',
    priceValue: 0,
    group: 'free',
  },
  {
    userType: 'supplier',
    label: 'Supplier',
    description: 'I supply materials, products, or jobsite deliveries',
    priceLabel: 'Free',
    priceValue: 0,
    group: 'free',
  },
  {
    userType: 'contractor',
    label: 'Contractor',
    description: 'I provide construction services',
    priceLabel: '$49.99/month',
    priceValue: 49.99,
    group: 'pro49',
  },
  {
    userType: 'landscaper',
    label: 'Landscaper',
    description: 'I provide landscaping and outdoor services',
    priceLabel: '$49.99/month',
    priceValue: 49.99,
    group: 'pro49',
  },
  {
    userType: 'school',
    label: 'Trade School',
    description: 'We train students for skilled trade careers',
    priceLabel: '$49.99/month',
    priceValue: 49.99,
    group: 'pro49',
  },
  {
    userType: 'commercial_builder',
    label: 'Commercial Builder',
    description: 'We build commercial projects and facilities',
    priceLabel: '$99.99/month',
    priceValue: 99.99,
    group: 'pro99',
  },
  {
    userType: 'multi_family_owner',
    label: 'Multi-Family Owner',
    description: 'We manage condos, duplexes, and multi-unit properties',
    priceLabel: '$99.99/month',
    priceValue: 99.99,
    group: 'pro99',
  },
  {
    userType: 'apartment_owner',
    label: 'Apartment Owner',
    description: 'We manage apartment communities and portfolios',
    priceLabel: '$99.99/month',
    priceValue: 99.99,
    group: 'pro99',
  },
  {
    userType: 'developer',
    label: 'Developer',
    description: 'We develop residential, commercial, or mixed-use projects',
    priceLabel: '$99.99/month',
    priceValue: 99.99,
    group: 'pro99',
  },
];

const ACCOUNT_GROUPS: Array<{ key: AccountOption['group']; title: string; subtitle: string }> = [
  { key: 'free', title: 'Free Access', subtitle: 'Homeowners, job seekers, and suppliers' },
  { key: 'pro49', title: '$49.99 / Month', subtitle: 'Field services and career partners' },
  { key: 'pro99', title: '$99.99 / Month', subtitle: 'Commercial and portfolio operators' },
];

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    userType: 'homeowner' as MobileUserType,
  });
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const selectedAccount = useMemo(
    () => ACCOUNT_OPTIONS.find((option) => option.userType === formData.userType) ?? ACCOUNT_OPTIONS[0],
    [formData.userType]
  );

  const handleRegister = async () => {
    if (step === 1) {
      if (!formData.fullName.trim()) {
        Alert.alert('Missing Information', 'Please enter your full name.');
        return;
      }
      setStep(2);
      return;
    }

    if (!formData.email || !formData.password) {
      Alert.alert('Missing Information', 'Please provide your email and password.');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const [firstName, ...rest] = formData.fullName.trim().split(/\s+/);
      const lastName = rest.join(' ') || 'User';

      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', data.message || 'Account created successfully. Please verify your email.', [
          { text: 'OK', onPress: onNavigateToLogin },
        ]);
      } else {
        Alert.alert('Registration Failed', data.error || 'Please try again');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>BuildVault</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>{step === 1 ? 'Tell us about yourself' : 'Set up your credentials'}</Text>
        </View>

        <View style={styles.form}>
          {step === 1 ? (
            <>
              <Text style={styles.label}>Choose account type:</Text>
              {ACCOUNT_GROUPS.map((group) => (
                <View key={group.key} style={styles.groupCard}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  <Text style={styles.groupSubtitle}>{group.subtitle}</Text>
                  <View style={styles.optionGrid}>
                    {ACCOUNT_OPTIONS.filter((option) => option.group === group.key).map((option) => {
                      const isSelected = option.userType === formData.userType;
                      return (
                        <TouchableOpacity
                          key={option.userType}
                          style={[styles.accountCard, isSelected && styles.accountCardSelected]}
                          onPress={() => updateField('userType', option.userType)}
                        >
                          <View style={styles.accountRow}>
                            <View style={styles.accountTextWrap}>
                              <Text style={styles.accountLabel}>{option.label}</Text>
                              <Text style={styles.accountDescription}>{option.description}</Text>
                            </View>
                            <View style={[styles.pricePill, isSelected && styles.pricePillSelected]}>
                              <Text style={[styles.pricePillText, isSelected && styles.pricePillTextSelected]}>{option.priceLabel}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fullName}
                  onChangeText={(text) => updateField('fullName', text)}
                  placeholder="John Doe"
                  autoCapitalize="words"
                />
              </View>

              <TouchableOpacity
                style={[styles.registerButton, !formData.fullName.trim() && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={!formData.fullName.trim()}
              >
                <Text style={styles.registerButtonText}>Continue</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.selectedSummaryCard}>
                <Text style={styles.selectedSummaryText}>{formData.fullName} • {selectedAccount.label}</Text>
                <Text style={[styles.selectedPriceText, selectedAccount.priceValue === 0 ? styles.selectedPriceFree : styles.selectedPricePaid]}>
                  {selectedAccount.priceLabel}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => updateField('password', text)}
                  placeholder="At least 8 characters"
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Text style={styles.passwordHint}>At least 8 characters</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backStepButton} onPress={() => setStep(1)}>
                  <Text style={styles.backStepButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.registerButton, styles.registerButtonInline, loading && styles.registerButtonDisabled]}
                  onPress={handleRegister}
                  disabled={loading || !formData.email || !formData.password}
                >
                  {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.registerButtonText}>Create Account</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.loginLink} onPress={onNavigateToLogin}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
  },
  form: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 40,
  },
  groupCard: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  groupTitle: {
    color: '#f3f4f6',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  groupSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 10,
    marginTop: 2,
  },
  optionGrid: {
    gap: 8,
  },
  accountCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#1f2937',
    padding: 12,
  },
  accountCardSelected: {
    borderColor: '#f97316',
    backgroundColor: '#7c2d12',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  accountTextWrap: {
    flex: 1,
  },
  accountLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  accountDescription: {
    color: '#d1d5db',
    fontSize: 12,
  },
  pricePill: {
    borderRadius: 999,
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pricePillSelected: {
    backgroundColor: '#f97316',
  },
  pricePillText: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '700',
  },
  pricePillTextSelected: {
    color: '#ffffff',
  },
  inputGroup: {
    marginTop: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#4b5563',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#f9fafb',
  },
  selectedSummaryCard: {
    borderWidth: 1,
    borderColor: '#4b5563',
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  selectedSummaryText: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  selectedPriceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  selectedPriceFree: {
    color: '#6ee7b7',
  },
  selectedPricePaid: {
    color: '#fdba74',
  },
  passwordHint: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  backStepButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4b5563',
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  backStepButtonText: {
    color: '#f3f4f6',
    fontSize: 15,
    fontWeight: '700',
  },
  registerButtonInline: {
    flex: 1,
    marginTop: 0,
  },
  registerButton: {
    backgroundColor: '#ea580c',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 15,
    color: '#9ca3af',
  },
  loginLinkBold: {
    color: '#fb923c',
    fontWeight: '700',
  },
});
