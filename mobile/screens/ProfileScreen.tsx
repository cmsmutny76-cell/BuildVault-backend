import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MobileScreenHeader from '../components/MobileScreenHeader';
import { revenueCatService } from '../services/revenueCat';
import { fetchSubscriptionFromBackend } from '../services/subscriptionSync';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const AUTH_TOKEN_KEY = 'buildvault.authToken';

interface UserProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  userType: 'homeowner' | 'contractor';
}

interface ProfileScreenProps {
  onBack: () => void;
  onNavigate?: (screen: 'contractorProfile') => void;
  userId?: string;
}

export default function ProfileScreen({ onBack, onNavigate, userId }: ProfileScreenProps) {
  const [isContractor, setIsContractor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    userType: 'homeowner',
  });

  const [contractorInfo, setContractorInfo] = useState({
    businessName: '',
    licenseNumber: '',
    serviceAreas: '',
    specialties: '',
  });

  // Load profile and subscription status on mount
  useEffect(() => {
    loadProfile();
    loadSubscriptionStatus();
  }, [userId]);

  const loadProfile = async () => {
    try {
      if (!userId) {
        setLoading(false);
        return;
      }
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(`${API_BASE_URL}/users/profile?userId=${userId}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.profile);
        setIsContractor(data.profile.userType === 'contractor');
        
        if (data.profile.businessName) {
          setContractorInfo({
            businessName: data.profile.businessName || '',
            licenseNumber: data.profile.licenseNumber || '',
            serviceAreas: (data.profile.serviceAreas || []).join(', '),
            specialties: (data.profile.specialties || []).join(', '),
          });
        }
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      // Check backend first — covers users who subscribed on the web via Stripe
      if (userId) {
        const backendResult = await fetchSubscriptionFromBackend(userId);
        if (backendResult.success && backendResult.subscription?.status === 'active') {
          const sub = backendResult.subscription;
          setSubscriptionStatus({
            isActive: true,
            isIntroPricing: sub.discountEndsAt ? new Date(sub.discountEndsAt) > new Date() : false,
            expiresAt: sub.discountEndsAt || null,
            productId: sub.plan || null,
          });
          return;
        }
      }
      // Fall back to RevenueCat — covers users who subscribed on mobile via App Store/Play Store
      const status = await revenueCatService.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.log('Error loading subscription status:', error);
    }
  };

  const handleStartIntroOffer = async () => {
    setSubscriptionLoading(true);
    try {
      const result = await revenueCatService.startIntroSubscription();
      
      if (result.success) {
        Alert.alert(
          'Intro Offer Started!',
          'Your $10/month intro period is now active. Start receiving leads today!',
          [{ text: 'Great!', onPress: loadSubscriptionStatus }]
        );
      } else {
        Alert.alert('Subscription Unavailable', result.error || 'Unable to start subscription at this time.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start subscription');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setSubscriptionLoading(true);
    try {
      const result = await revenueCatService.restorePurchases();
      
      if (result.success) {
        await loadSubscriptionStatus();
        Alert.alert('Success', 'Your purchases have been restored!');
      } else {
        Alert.alert('No Purchases', 'No previous purchases found to restore.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to restore purchases');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Error', 'Unable to identify your account. Please sign in again.');
      return;
    }

    const profileData = {
      ...profile,
      userType: isContractor ? 'contractor' : 'homeowner',
      ...(isContractor && {
        businessName: contractorInfo.businessName,
        licenseNumber: contractorInfo.licenseNumber,
        serviceAreas: contractorInfo.serviceAreas.split(',').map(s => s.trim()),
        specialties: contractorInfo.specialties.split(',').map(s => s.trim()),
      }),
    };

    setSaving(true);

    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId,
          ...profileData,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to save profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MobileScreenHeader
        onBack={onBack}
        backLabel="← Back"
        title="Profile"
        subtitle="Manage your account"
        theme="dark"
      />

      <ScrollView style={styles.content}>
        {/* User Type Toggle */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>I am a Contractor</Text>
              <Text style={styles.toggleSubtext}>
                {isContractor ? 'Contractor features enabled' : 'Switch to contractor mode'}
              </Text>
            </View>
            <Switch
              value={isContractor}
              onValueChange={setIsContractor}
              trackColor={{ false: '#d1d5db', true: '#10b981' }}
              thumbColor={isContractor ? '#059669' : '#f3f4f6'}
            />
          </View>
          
          {/* Contractor Profile Setup Button */}
          {isContractor && onNavigate && (
            <TouchableOpacity
              style={styles.contractorProfileButton}
              onPress={() => onNavigate('contractorProfile')}
            >
              <View style={styles.contractorProfileContent}>
                <Text style={styles.contractorProfileIcon}>🏆</Text>
                <View style={styles.contractorProfileText}>
                  <Text style={styles.contractorProfileTitle}>Complete Contractor Profile</Text>
                  <Text style={styles.contractorProfileSubtext}>
                    Set up detailed profile for AI-powered project matching
                  </Text>
                </View>
                <Text style={styles.contractorProfileArrow}>→</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Information */}
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.card}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={profile.firstName}
            onChangeText={(text) => setProfile({ ...profile, firstName: text })}
            placeholder="John"
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={profile.lastName}
            onChangeText={(text) => setProfile({ ...profile, lastName: text })}
            placeholder="Doe"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => setProfile({ ...profile, email: text })}
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={profile.phone}
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
          />
        </View>

        {/* Address */}
        <Text style={styles.sectionTitle}>Address</Text>
        
        <View style={styles.card}>
          <Text style={styles.label}>Street Address</Text>
          <TextInput
            style={styles.input}
            value={profile.address}
            onChangeText={(text) => setProfile({ ...profile, address: text })}
            placeholder="123 Main St"
          />

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={profile.city}
            onChangeText={(text) => setProfile({ ...profile, city: text })}
            placeholder="Los Angeles"
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={profile.state}
                onChangeText={(text) => setProfile({ ...profile, state: text.toUpperCase() })}
                placeholder="CA"
                maxLength={2}
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>ZIP Code</Text>
              <TextInput
                style={styles.input}
                value={profile.zipCode}
                onChangeText={(text) => setProfile({ ...profile, zipCode: text })}
                placeholder="90001"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>
        </View>

        {/* Contractor Information */}
        {isContractor && (
          <>
            <Text style={styles.sectionTitle}>Contractor Information</Text>
            
            <View style={styles.card}>
              <Text style={styles.label}>Business Name</Text>
              <TextInput
                style={styles.input}
                value={contractorInfo.businessName}
                onChangeText={(text) => setContractorInfo({ ...contractorInfo, businessName: text })}
                placeholder="ABC Construction LLC"
              />

              <Text style={styles.label}>License Number</Text>
              <TextInput
                style={styles.input}
                value={contractorInfo.licenseNumber}
                onChangeText={(text) => setContractorInfo({ ...contractorInfo, licenseNumber: text })}
                placeholder="C-12345678"
              />

              <Text style={styles.label}>Service Areas (comma-separated ZIP codes)</Text>
              <TextInput
                style={styles.input}
                value={contractorInfo.serviceAreas}
                onChangeText={(text) => setContractorInfo({ ...contractorInfo, serviceAreas: text })}
                placeholder="90001, 90002, 90003"
              />

              <Text style={styles.label}>Specialties (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={contractorInfo.specialties}
                onChangeText={(text) => setContractorInfo({ ...contractorInfo, specialties: text })}
                placeholder="Roofing, Flooring, Painting"
                multiline
              />
            </View>

            {/* Subscription Info - RevenueCat Integration */}
            {subscriptionStatus ? (
              <View style={[
                styles.card, 
                subscriptionStatus.isActive ? styles.activeSubscriptionCard : styles.subscriptionCard
              ]}>
                {subscriptionStatus.isActive ? (
                  <>
                    <Text style={styles.subscriptionTitle}>
                      ✅ {subscriptionStatus.isIntroPricing ? 'Intro Pricing Active' : 'Subscription Active'}
                    </Text>
                    <Text style={styles.subscriptionText}>
                      {subscriptionStatus.expiresAt
                        ? subscriptionStatus.isIntroPricing
                          ? `Your intro period ends on ${new Date(subscriptionStatus.expiresAt).toLocaleDateString()}`
                          : `Next billing: ${new Date(subscriptionStatus.expiresAt).toLocaleDateString()}`
                        : 'Subscription is active.'
                      }
                    </Text>
                    <Text style={styles.subscriptionSubtext}>
                      You're receiving qualified contractor leads!
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.subscriptionTitle}>🎉 90-Day Intro Offer</Text>
                    <Text style={styles.subscriptionText}>
                      Choose your professional plan to manage projects more effectively.
                    </Text>
                    <TouchableOpacity 
                      style={[styles.subscriptionButton, subscriptionLoading && styles.buttonDisabled]}
                      onPress={handleStartIntroOffer}
                      disabled={subscriptionLoading}
                    >
                      <Text style={styles.subscriptionButtonText}>
                        {subscriptionLoading ? 'Starting Subscription...' : 'Start Subscription'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                
                <TouchableOpacity 
                  style={styles.restoreButton}
                  onPress={handleRestorePurchases}
                  disabled={subscriptionLoading}
                >
                  <Text style={styles.restoreButtonText}>
                    {subscriptionLoading ? 'Restoring...' : 'Restore Purchases'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.card}>
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text style={styles.loadingSubtext}>Loading subscription info...</Text>
              </View>
            )}
          </>
        )}

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 10,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.22)',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.24)',
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  toggleSubtext: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  subscriptionCard: {
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  activeSubscriptionCard: {
    backgroundColor: 'rgba(30,64,175,0.20)',
    borderWidth: 2,
    borderColor: '#60a5fa',
  },
  subscriptionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subscriptionText: {
    fontSize: 15,
    color: '#e2e8f0',
    marginBottom: 8,
    lineHeight: 22,
  },
  subscriptionSubtext: {
    fontSize: 13,
    color: '#D4AF37',
    marginTop: 4,
    fontStyle: 'italic',
  },
  subscriptionPrice: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 12,
  },
  subscriptionButton: {
    backgroundColor: '#D4AF37',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  subscriptionButtonText: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  restoreButton: {
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  restoreButtonText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#D4AF37',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
  },
  loadingSubtext: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  contractorProfileButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  contractorProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contractorProfileIcon: {
    fontSize: 32,
  },
  contractorProfileText: {
    flex: 1,
  },
  contractorProfileTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  contractorProfileSubtext: {
    fontSize: 13,
    color: '#93c5fd',
    lineHeight: 18,
  },
  contractorProfileArrow: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: '700',
  },
});
