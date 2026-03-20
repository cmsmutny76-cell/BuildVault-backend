import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import type { Screen } from '../types/navigation';

interface FindContractorsScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  selectedProjectTitle?: string;
  hasSelectedProject: boolean;
}

export default function FindContractorsScreen({
  onBack,
  onNavigate,
  selectedProjectTitle,
  hasSelectedProject,
}: FindContractorsScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Find Contractors</Text>
        </View>

        {/* Content */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👷 Find Verified Contractors</Text>
          <Text style={styles.description}>
            Connect with licensed, insured contractors and get AI-ranked matches based on your selected project.
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✓ Verified contractor directory</Text>
            <Text style={styles.featureItem}>✓ Reviews and ratings</Text>
            <Text style={styles.featureItem}>✓ License verification</Text>
            <Text style={styles.featureItem}>✓ Direct messaging</Text>
            <Text style={styles.featureItem}>✓ Request multiple quotes</Text>
          </View>

          <View style={styles.projectContextCard}>
            <Text style={styles.projectContextTitle}>Project Context</Text>
            <Text style={styles.projectContextText}>
              {hasSelectedProject
                ? `Using: ${selectedProjectTitle || 'Selected Project'}`
                : 'No project selected. Choose one in Home before AI matching.'}
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => onNavigate('contractorSearch')}>
            <Text style={styles.primaryButtonText}>Open Contractor Search</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Search supports both AI matching (project-based) and manual filters.
          </Text>
        </View>
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
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 20,
    lineHeight: 24,
  },
  featureList: {
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 8,
    paddingLeft: 8,
  },
  projectContextCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  projectContextTitle: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectContextText: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
  placeholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
