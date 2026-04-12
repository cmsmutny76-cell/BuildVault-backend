import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BrandLockup from './BrandLockup';

interface MobileScreenHeaderProps {
  onBack?: () => void;
  backLabel?: string;
  title: string;
  subtitle?: string;
  theme?: 'light' | 'dark';
}

export default function MobileScreenHeader({
  onBack,
  backLabel = 'Back',
  title,
  subtitle,
  theme = 'light',
}: MobileScreenHeaderProps) {
  const isDark = theme === 'dark';

  return (
    <View style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backButton, isDark ? styles.darkBackButton : styles.lightBackButton]}
        >
          <Text style={[styles.backButtonText, isDark ? styles.darkBackButtonText : styles.lightBackButtonText]}>
            {backLabel}
          </Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.brandWrap}>
        <BrandLockup theme={isDark ? 'dark' : 'light'} variant="compact" />
      </View>

      <Text style={[styles.title, isDark ? styles.darkTitle : styles.lightTitle]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, isDark ? styles.darkSubtitle : styles.lightSubtitle]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  lightContainer: {
    backgroundColor: '#ffffff',
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  darkContainer: {
    paddingTop: 42,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  lightBackButton: {},
  darkBackButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lightBackButtonText: {
    color: '#3b82f6',
  },
  darkBackButtonText: {
    color: '#D4AF37',
  },
  brandWrap: {
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: -0.6,
  },
  lightTitle: {
    color: '#0f172a',
  },
  darkTitle: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 520,
  },
  lightSubtitle: {
    color: '#64748b',
  },
  darkSubtitle: {
    color: '#CCCCCC',
  },
});