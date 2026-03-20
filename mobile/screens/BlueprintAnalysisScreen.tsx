import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';

interface BlueprintAnalysisScreenProps {
  onBack: () => void;
}

export default function BlueprintAnalysisScreen({ onBack }: BlueprintAnalysisScreenProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const handleRunDemo = async () => {
    try {
      setLoading(true);
      const demoBlob = new Blob(['blueprint-demo'], { type: 'image/png' });
      const response = await api.ai.analyzeBlueprint(demoBlob, 'residential', {
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
      });

      if (!response.success) {
        Alert.alert('Blueprint analysis', response.error || 'Failed to analyze blueprint');
        return;
      }

      setResult(response.blueprint || null);
    } catch (error) {
      Alert.alert('Blueprint analysis', 'Unable to connect to analysis service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Blueprint Analysis</Text>
        </View>

        {/* Content */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📐 Blueprint Analysis</Text>
          <Text style={styles.description}>
            Upload and analyze construction blueprints with AI-powered insights.
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✓ Automatic measurement extraction</Text>
            <Text style={styles.featureItem}>✓ Material quantity estimates</Text>
            <Text style={styles.featureItem}>✓ Code compliance checks</Text>
            <Text style={styles.featureItem}>✓ 3D visualization</Text>
          </View>

          <TouchableOpacity style={styles.runButton} onPress={handleRunDemo} disabled={loading}>
            {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.runButtonText}>Run Demo Analysis</Text>}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>Results Snapshot</Text>
            <Text style={styles.placeholderText}>
              Total sqft: {String((result.dimensions as { totalSquareFootage?: string })?.totalSquareFootage || '-')}
            </Text>
            <Text style={styles.placeholderText}>
              Foundation: {String((result.structural as { foundationType?: string })?.foundationType || '-')}
            </Text>
            <Text style={styles.placeholderText}>
              Roof: {String((result.structural as { roofType?: string })?.roofType || '-')}
            </Text>
          </View>
        )}
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
  runButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  runButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  placeholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  placeholderTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 10,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
