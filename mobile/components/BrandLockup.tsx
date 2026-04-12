import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface BrandLockupProps {
  subtitle?: string;
  variant?: 'hero' | 'compact';
  theme?: 'light' | 'dark';
}

export default function BrandLockup({
  subtitle,
  variant = 'hero',
  theme = 'light',
}: BrandLockupProps) {
  const isHero = variant === 'hero';
  const isDark = theme === 'dark';

  return (
    <View style={[styles.container, isHero ? styles.heroContainer : styles.compactContainer]}>
      <Image
        source={require('../assets/splash-icon.png')}
        style={isHero ? styles.heroLogo : styles.compactLogo}
        resizeMode="contain"
      />
      <View style={[styles.textWrap, isHero ? styles.heroTextWrap : styles.compactTextWrap]}>
        <Text style={[styles.title, isHero ? styles.heroTitle : styles.compactTitle, isDark ? styles.darkTitle : styles.lightTitle]}>
          BuildVault
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              isHero ? styles.heroSubtitle : styles.compactSubtitle,
              isDark ? styles.darkSubtitle : styles.lightSubtitle,
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  heroContainer: {
    gap: 10,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroLogo: {
    width: 196,
    height: 196,
  },
  compactLogo: {
    width: 56,
    height: 56,
  },
  textWrap: {
    alignItems: 'center',
  },
  heroTextWrap: {
    alignItems: 'center',
  },
  compactTextWrap: {
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  heroTitle: {
    fontSize: 38,
    lineHeight: 42,
  },
  compactTitle: {
    fontSize: 22,
    lineHeight: 26,
  },
  subtitle: {
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 17,
    lineHeight: 23,
    marginTop: 4,
  },
  compactSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  lightTitle: {
    color: '#0f172a',
  },
  darkTitle: {
    color: '#D4AF37',
  },
  lightSubtitle: {
    color: '#64748b',
  },
  darkSubtitle: {
    color: '#94a3b8',
  },
});