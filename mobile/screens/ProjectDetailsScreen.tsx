import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

interface ProjectDetailsScreenProps {
  onBack: () => void;
  addressId?: string;
}

export default function ProjectDetailsScreen({ onBack, addressId }: ProjectDetailsScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Project Details</Text>
        </View>

        {/* Address Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Project Location</Text>
          <Text style={styles.address}>123 Main Street</Text>
          <Text style={styles.subAddress}>Los Angeles, CA 90001</Text>
        </View>

        {/* Project Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Project Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>🔨 In Progress</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statLabel}>Active Projects</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>65%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        </View>

        {/* Active Projects */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Projects</Text>
          
          <View style={styles.projectItem}>
            <Text style={styles.projectName}>Kitchen Remodel</Text>
            <Text style={styles.projectType}>Remodeling</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
            <Text style={styles.progressText}>75% Complete</Text>
          </View>

          <View style={styles.projectItem}>
            <Text style={styles.projectName}>Backyard Landscaping</Text>
            <Text style={styles.projectType}>Landscaping</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '40%' }]} />
            </View>
            <Text style={styles.progressText}>40% Complete</Text>
          </View>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Full project tracking is in active beta. You can continue testing with project selection and estimate flows.
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={onBack}>
            <Text style={styles.actionButtonText}>Return to Projects</Text>
          </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  address: {
    fontSize: 18,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  subAddress: {
    fontSize: 16,
    color: '#94a3b8',
  },
  statusBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  statusText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  projectItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  projectType: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#94a3b8',
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
    marginBottom: 14,
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
});
