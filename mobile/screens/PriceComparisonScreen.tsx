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

interface PriceComparisonScreenProps {
  onBack: () => void;
}

export default function PriceComparisonScreen({ onBack }: PriceComparisonScreenProps) {
  const [projectType, setProjectType] = useState('residential-remodel');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('78701');
  const [materialsText, setMaterialsText] = useState('2x4 lumber\ndrywall sheets\nGFCI outlets');
  const [customStoreInput, setCustomStoreInput] = useState('');
  const [customStores, setCustomStores] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const addCustomStore = () => {
    const value = customStoreInput.trim();
    if (!value) return;
    if (!customStores.includes(value)) {
      setCustomStores([...customStores, value]);
    }
    setCustomStoreInput('');
  };

  const removeCustomStore = (storeName: string) => {
    setCustomStores(customStores.filter((store) => store !== storeName));
  };

  const runComparison = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const materials = materialsText
        .split('\n')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({ name, quantity: '1', unit: 'unit' }));

      if (materials.length === 0) {
        throw new Error('Please add at least one material item.');
      }

      const response = await fetch('http://localhost:3000/api/material-quotes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials,
          projectType,
          city,
          state,
          zipCode,
          userAddedStores: customStores,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Comparison failed');
      }

      setResult(data);
    } catch (comparisonError) {
      setError(comparisonError instanceof Error ? comparisonError.message : 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Price Comparison</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Price Comparison Tool</Text>
          <Text style={styles.description}>
            Home Depot and Lowes are primary sources. AI also searches local stores and your custom stores.
          </Text>

          <View style={styles.formGrid}>
            <TextInput style={styles.input} value={projectType} onChangeText={setProjectType} placeholder="Project Type" placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} value={state} onChangeText={(text) => setState(text.toUpperCase())} placeholder="State" placeholderTextColor="#94a3b8" maxLength={2} />
            <TextInput style={styles.input} value={zipCode} onChangeText={setZipCode} placeholder="ZIP" placeholderTextColor="#94a3b8" />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={materialsText}
              onChangeText={setMaterialsText}
              placeholder="Materials (one per line)"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
            />

            <View style={styles.storeRow}>
              <TextInput style={[styles.input, styles.storeInput]} value={customStoreInput} onChangeText={setCustomStoreInput} placeholder="Add store" placeholderTextColor="#94a3b8" />
              <TouchableOpacity style={styles.addButton} onPress={addCustomStore}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {customStores.length > 0 && (
              <View style={styles.storeChips}>
                {customStores.map((store) => (
                  <TouchableOpacity key={store} onPress={() => removeCustomStore(store)} style={styles.storeChip}>
                    <Text style={styles.storeChipText}>{store} ✕</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.actionButton} onPress={runComparison} disabled={loading}>
            <Text style={styles.actionButtonText}>{loading ? 'Searching Stores...' : 'Run AI Price Comparison'}</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.placeholder}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}

        {result?.quote && (
          <View style={styles.placeholder}>
            <Text style={styles.sectionTitle}>Estimated Total: ${result.quote.totalCost}</Text>
            <Text style={styles.placeholderText}>Primary Sources: {(result.quote.primaryRetailers || []).join(', ')}</Text>
            <Text style={styles.placeholderText}>AI Local Stores: {(result.aiLocalStores || []).join(', ') || 'N/A'}</Text>
            <Text style={styles.placeholderText}>Compared: {(result.quote.retailersCompared || []).join(', ')}</Text>

            <View style={styles.resultList}>
              {(result.quote.materials || []).map((material: any) => (
                <View key={material.name} style={styles.resultItem}>
                  <Text style={styles.resultTitle}>{material.name}</Text>
                  <Text style={styles.resultSubtitle}>Best: {material.bestRetailer} (${Number(material.bestPrice).toFixed(2)})</Text>
                </View>
              ))}
            </View>
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
    marginBottom: 12,
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
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  storeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  storeInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  storeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  storeChip: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.45)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  storeChipText: {
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  resultList: {
    marginTop: 10,
    gap: 8,
  },
  resultItem: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  resultTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  resultSubtitle: {
    color: '#cbd5e1',
    fontSize: 12,
  },
});
