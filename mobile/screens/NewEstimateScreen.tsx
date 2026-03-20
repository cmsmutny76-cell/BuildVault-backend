import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';

interface NewEstimateScreenProps {
  onBack: () => void;
  currentUserId?: string;
  isContractor?: boolean;
  defaultProjectId?: string;
  defaultProjectTitle?: string;
  defaultContractorId?: string;
}

export default function NewEstimateScreen({
  onBack,
  currentUserId,
  isContractor,
  defaultProjectId,
  defaultProjectTitle,
  defaultContractorId,
}: NewEstimateScreenProps) {
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [contractorId, setContractorId] = useState(
    defaultContractorId || (isContractor ? (currentUserId || '') : '')
  );
  const [projectTitle, setProjectTitle] = useState(defaultProjectTitle || 'Kitchen Remodel');
  const [timeline, setTimeline] = useState('6-8 weeks');
  const [scopeText, setScopeText] = useState('Replace cabinets, countertops, flooring, and lighting.');
  const [notes, setNotes] = useState('30% deposit, 40% midpoint, 30% completion.');
  const [loading, setLoading] = useState(false);

  const [lineItems, setLineItems] = useState([
    { description: 'Demolition and disposal', quantity: '1', unitPrice: '2500', category: 'labor' },
    { description: 'Cabinet installation', quantity: '20', unitPrice: '350', category: 'materials' },
  ]);

  useEffect(() => {
    setProjectId(defaultProjectId || '');
  }, [defaultProjectId]);

  useEffect(() => {
    setProjectTitle(defaultProjectTitle || 'Kitchen Remodel');
  }, [defaultProjectTitle]);

  useEffect(() => {
    if (defaultContractorId) {
      setContractorId(defaultContractorId);
    } else {
      setContractorId(isContractor ? (currentUserId || '') : '');
    }
  }, [currentUserId, isContractor, defaultContractorId]);

  const computedTotal = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
    const tax = subtotal * 0.0825;
    return { subtotal, tax, total: subtotal + tax };
  }, [lineItems]);

  const updateItem = (index: number, field: string, value: string) => {
    const next = [...lineItems];
    next[index] = { ...next[index], [field]: value };
    setLineItems(next);
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: '', quantity: '1', unitPrice: '0', category: 'labor' },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) {
      return;
    }
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateDescription = async () => {
    try {
      setLoading(true);
      const response = await api.ai.generateDescription({
        projectType: projectTitle,
        scope: scopeText,
        timeline,
      });

      const nextSteps = Array.isArray(response.result?.recommendedNextSteps)
        ? response.result.recommendedNextSteps.join(' | ')
        : '';

      setNotes(`${response.result?.summary || notes}${nextSteps ? `\nNext: ${nextSteps}` : ''}`);
    } catch (error) {
      Alert.alert('Description helper', 'Unable to generate description right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEstimate = async () => {
    try {
      setLoading(true);

      const payload = {
        projectId,
        contractorId,
        projectTitle,
        notes,
        lineItems: lineItems
          .filter((item) => item.description.trim())
          .map((item) => ({
            description: item.description.trim(),
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            category: item.category as 'labor' | 'materials' | 'equipment' | 'permits' | 'other',
          })),
      };

      if (!payload.lineItems.length) {
        Alert.alert('Missing line items', 'Please add at least one line item.');
        return;
      }

      if (!payload.projectId || !payload.contractorId) {
        Alert.alert('Missing project context', 'A valid project and contractor are required to create an estimate.');
        return;
      }

      const created = await api.quote.generateEstimate(payload);
      Alert.alert('Estimate created', `Estimate ID: ${created.estimate?.id || 'n/a'}`);
    } catch (error) {
      Alert.alert('Create estimate', 'Unable to create estimate. Check backend is running.');
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
          <Text style={styles.title}>New Estimate</Text>
        </View>

        {/* Content */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Estimate Builder</Text>
          <Text style={styles.description}>Build and submit a line-item estimate to the backend API.</Text>

          <Text style={styles.label}>Project ID</Text>
          <TextInput style={styles.input} value={projectId} onChangeText={setProjectId} placeholder="proj1" placeholderTextColor="#94a3b8" />

          <Text style={styles.label}>Contractor ID</Text>
          <TextInput style={styles.input} value={contractorId} onChangeText={setContractorId} placeholder="c1" placeholderTextColor="#94a3b8" />

          <Text style={styles.label}>Project Title</Text>
          <TextInput style={styles.input} value={projectTitle} onChangeText={setProjectTitle} placeholder="Kitchen Remodel" placeholderTextColor="#94a3b8" />

          <Text style={styles.label}>Scope / Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={scopeText}
            onChangeText={setScopeText}
            placeholder="Describe work scope"
            placeholderTextColor="#94a3b8"
            multiline
          />

          <Text style={styles.label}>Timeline</Text>
          <TextInput style={styles.input} value={timeline} onChangeText={setTimeline} placeholder="6-8 weeks" placeholderTextColor="#94a3b8" />

          <TouchableOpacity style={styles.secondaryButton} onPress={handleGenerateDescription} disabled={loading}>
            <Text style={styles.secondaryButtonText}>Generate Professional Notes (AI)</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Payment schedule, assumptions, etc."
            placeholderTextColor="#94a3b8"
            multiline
          />

          <Text style={styles.cardTitle}>Line Items</Text>
          {lineItems.map((item, index) => (
            <View key={`li-${index}`} style={styles.lineItemCard}>
              <TextInput
                style={styles.input}
                value={item.description}
                onChangeText={(value) => updateItem(index, 'description', value)}
                placeholder="Description"
                placeholderTextColor="#94a3b8"
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  value={item.quantity}
                  onChangeText={(value) => updateItem(index, 'quantity', value)}
                  placeholder="Qty"
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  value={item.unitPrice}
                  onChangeText={(value) => updateItem(index, 'unitPrice', value)}
                  placeholder="Unit Price"
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.row}>
                {['labor', 'materials', 'equipment', 'permits', 'other'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryChip, item.category === category && styles.categoryChipActive]}
                    onPress={() => updateItem(index, 'category', category)}
                  >
                    <Text style={[styles.categoryChipText, item.category === category && styles.categoryChipTextActive]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.removeButton} onPress={() => removeLineItem(index)}>
                <Text style={styles.removeButtonText}>Remove Line Item</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.secondaryButton} onPress={addLineItem}>
            <Text style={styles.secondaryButtonText}>+ Add Line Item</Text>
          </TouchableOpacity>

          <View style={styles.totalsBox}>
            <Text style={styles.totalsText}>Subtotal: ${computedTotal.subtotal.toFixed(2)}</Text>
            <Text style={styles.totalsText}>Tax: ${computedTotal.tax.toFixed(2)}</Text>
            <Text style={styles.totalPrimary}>Total: ${computedTotal.total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity style={styles.createButton} onPress={handleCreateEstimate} disabled={loading}>
            {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.createButtonText}>Create Estimate</Text>}
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
  description: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 20,
    lineHeight: 24,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    marginBottom: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  halfInput: {
    flex: 1,
    minWidth: 120,
  },
  lineItemCard: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryChipActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  categoryChipText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  categoryChipTextActive: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  removeButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: '#fca5a5',
    fontSize: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
  },
  totalsBox: {
    borderTopWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    paddingTop: 10,
    marginTop: 6,
  },
  totalsText: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 4,
  },
  totalPrimary: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  createButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
  },
});
