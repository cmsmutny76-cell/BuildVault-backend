import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';

interface BuildingCodesScreenProps {
  onBack: () => void;
}

export default function BuildingCodesScreen({ onBack }: BuildingCodesScreenProps) {
  const [projectId, setProjectId] = useState('proj1');
  const [userId, setUserId] = useState('user_2');
  const [projectType, setProjectType] = useState('residential-remodel');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('78701');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<any>(null);

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setReport(null);

    try {
      const response = await fetch('http://localhost:3000/api/building-codes/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userId,
          projectType,
          location: {
            city,
            state,
            zipCode,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setReport(data.report || data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const priorityOrder: string[] = report?.agencies?.priority || ['federal', 'state', 'city', 'county'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Building Codes</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏛️ Building Codes & Regulations</Text>
          <Text style={styles.description}>
            Internet-based agency lookup with federal → state → city priority.
          </Text>

          <View style={styles.formGrid}>
            <TextInput style={styles.input} value={projectId} onChangeText={setProjectId} placeholder="Project ID" placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} value={userId} onChangeText={setUserId} placeholder="User ID" placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} value={projectType} onChangeText={setProjectType} placeholder="Project Type" placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} value={state} onChangeText={(text) => setState(text.toUpperCase())} placeholder="State" placeholderTextColor="#94a3b8" maxLength={2} />
            <TextInput style={styles.input} value={zipCode} onChangeText={setZipCode} placeholder="ZIP" placeholderTextColor="#94a3b8" />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.actionButton} onPress={generateReport} disabled={loading}>
            <Text style={styles.actionButtonText}>{loading ? 'Generating...' : 'Generate Code Report'}</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.placeholder}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}

        {report && (
          <View style={styles.placeholder}>
            <Text style={styles.sectionTitle}>Agency Priority Order</Text>
            <Text style={styles.placeholderText}>{priorityOrder.join(' → ')}</Text>

            {priorityOrder.map((scope) => {
              const agencies = report?.agencies?.[scope] || [];
              if (!Array.isArray(agencies) || agencies.length === 0) return null;
              return (
                <View key={scope} style={styles.agencyGroup}>
                  <Text style={styles.agencyGroupTitle}>{scope.toUpperCase()}</Text>
                  {agencies.map((agency: any) => (
                    <Text key={`${scope}-${agency.name}`} style={styles.agencyItem}>• {agency.name}</Text>
                  ))}
                </View>
              );
            })}

            <Text style={styles.sectionTitle}>Code & Hardware Summary</Text>
            <Text style={styles.monoText}>{JSON.stringify(report.codes, null, 2)}</Text>
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
    marginBottom: 16,
    lineHeight: 24,
  },
  formGrid: {
    gap: 10,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  placeholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  agencyGroup: {
    marginTop: 10,
  },
  agencyGroupTitle: {
    color: '#fcd34d',
    fontWeight: '700',
    marginBottom: 6,
  },
  agencyItem: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 4,
  },
  monoText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
});
