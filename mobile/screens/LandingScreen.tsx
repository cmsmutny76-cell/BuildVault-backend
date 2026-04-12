import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import BrandLockup from '../components/BrandLockup';

interface LandingScreenProps {
  onContinue: () => void;
}

export default function LandingScreen({ onContinue }: LandingScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <BrandLockup subtitle="Construction Project Management" theme="dark" variant="hero" />

        <TouchableOpacity style={styles.ctaButton} onPress={onContinue}>
          <Text style={styles.ctaButtonText}>Sign In / Create Account</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Connect with contractors, manage projects, and secure your investments.
        </Text>

        <View style={styles.pricingWrap}>
          <Text style={styles.pricingHeadline}>
            $10 / month for your first 90 days for all paid subscriptions
          </Text>
          <Text style={styles.pricingSubtext}>
            Then $49.99/mo (Contractor Plan) or $99.99/mo (Business Plan) - cancel anytime.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171923',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ctaButton: {
    backgroundColor: '#ea580c',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  footerText: {
    color: '#a0aec0',
    textAlign: 'center',
    fontSize: 17,
    marginTop: 22,
  },
  pricingWrap: {
    marginTop: 30,
    alignItems: 'center',
  },
  pricingHeadline: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  pricingSubtext: {
    color: '#a0aec0',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
});
