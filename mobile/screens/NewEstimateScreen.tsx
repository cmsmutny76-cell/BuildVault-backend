import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

interface NewEstimateScreenProps {
  onBack: () => void;
  onNavigate?: (screen: 'photoAnalysis') => void;
}

export default function NewEstimateScreen({ onBack, onNavigate }: NewEstimateScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Estimate</Text>
        </View>

        {/* Content */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Create New Estimate</Text>
          <Text style={styles.description}>
            Get instant cost estimates for your construction project.
          </Text>
          
          <View style={styles.stepList}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Select project type</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Upload photos or blueprints</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Add project details</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Get instant estimate</Text>
            </View>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Beta Ready</Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (onNavigate) {
                onNavigate('photoAnalysis');
              } else {
                onBack();
              }
            }}
          >
            <Text style={styles.actionButtonText}>Start Photo Analysis</Text>
          </TouchableOpacity>
        </View>

        {/* Project Types */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Project Types</Text>
          
          <View style={styles.typeGrid}>
            <View style={styles.typeItem}>
              <Text style={styles.typeIcon}>🏠</Text>
              <Text style={styles.typeText}>Residential</Text>
            </View>
            <View style={styles.typeItem}>
              <Text style={styles.typeIcon}>🏢</Text>
              <Text style={styles.typeText}>Commercial</Text>
            </View>
            <View style={styles.typeItem}>
              <Text style={styles.typeIcon}>🌳</Text>
              <Text style={styles.typeText}>Landscaping</Text>
            </View>
            <View style={styles.typeItem}>
              <Text style={styles.typeIcon}>🔨</Text>
              <Text style={styles.typeText}>Remodeling</Text>
            </View>
          </View>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            This feature will provide AI-powered cost estimates based on your 
            project photos, blueprints, and specifications.
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
  stepList: {
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
  },
  stepText: {
    fontSize: 15,
    color: '#cbd5e1',
    flex: 1,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  typeItem: {
    width: '50%',
    padding: 8,
  },
  typeIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  typeText: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    fontWeight: '600',
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
