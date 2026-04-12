import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

interface PermitAssistanceScreenProps {
  onBack: () => void;
  onNavigate?: (screen: 'buildingCodes') => void;
}

export default function PermitAssistanceScreen({ onBack, onNavigate }: PermitAssistanceScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Permit Assistance</Text>
        </View>

        {/* Content */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Building Permit Assistance</Text>
          <Text style={styles.description}>
            Streamline your permit application process with expert guidance.
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✓ Permit requirement lookup</Text>
            <Text style={styles.featureItem}>✓ Application preparation</Text>
            <Text style={styles.featureItem}>✓ Document checklist</Text>
            <Text style={styles.featureItem}>✓ Status tracking</Text>
            <Text style={styles.featureItem}>✓ Expert consultation</Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Beta Ready</Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (onNavigate) {
                onNavigate('buildingCodes');
              } else {
                onBack();
              }
            }}
          >
            <Text style={styles.actionButtonText}>Open Building Codes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            This feature will guide you through the permit application process, 
            ensuring you have all required documentation and approvals.
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
  statusBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  statusText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
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
