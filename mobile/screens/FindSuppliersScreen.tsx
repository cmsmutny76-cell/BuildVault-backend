import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MobileScreenHeader from '../components/MobileScreenHeader';
import { supplierAPI, type MobileUserType, type SupplierDirectoryEntry } from '../services/api';

interface FindSuppliersScreenProps {
  onBack: () => void;
  viewerType: MobileUserType;
}

function formatUserTypeLabel(value: MobileUserType) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function FindSuppliersScreen({ onBack, viewerType }: FindSuppliersScreenProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierDirectoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => `Visible to ${formatUserTypeLabel(viewerType)}`, [viewerType]);

  const loadSuppliers = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const response = await supplierAPI.getSuppliers(viewerType);
      setSuppliers(response.suppliers || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load suppliers';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [viewerType]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleCall = async (phone?: string) => {
    if (!phone) {
      Alert.alert('No phone listed', 'This supplier has not provided a phone number.');
      return;
    }

    const link = `tel:${phone}`;
    const canOpen = await Linking.canOpenURL(link);
    if (!canOpen) {
      Alert.alert('Call unavailable', 'Your device cannot open the dialer right now.');
      return;
    }

    await Linking.openURL(link);
  };

  const handleEmail = async (email: string) => {
    const link = `mailto:${email}`;
    const canOpen = await Linking.canOpenURL(link);
    if (!canOpen) {
      Alert.alert('Email unavailable', 'Your device cannot open the mail app right now.');
      return;
    }

    await Linking.openURL(link);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <MobileScreenHeader
          onBack={onBack}
          backLabel="<- Back"
          title="Find Suppliers"
          subtitle={title}
          theme="dark"
        />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.centerText}>Loading supplier directory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MobileScreenHeader
        onBack={onBack}
        backLabel="<- Back"
        title="Find Suppliers"
        subtitle={title}
        theme="dark"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSuppliers(true); }} />}
      >
        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Unable to load suppliers</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadSuppliers()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!error && suppliers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No suppliers match your audience yet</Text>
            <Text style={styles.emptyText}>
              Suppliers can choose who sees their profile. Check back soon as more suppliers opt in.
            </Text>
          </View>
        ) : null}

        {suppliers.map((supplier) => (
          <View key={supplier.id} style={styles.card}>
            <Text style={styles.name}>{supplier.businessName}</Text>
            <Text style={styles.location}>{[supplier.city, supplier.state].filter(Boolean).join(', ') || 'Location pending'}</Text>

            {supplier.supplierDescription ? (
              <Text style={styles.description}>{supplier.supplierDescription}</Text>
            ) : null}

            <Text style={styles.sectionLabel}>Categories</Text>
            <Text style={styles.sectionValue}>{supplier.supplierCategories.join(', ') || 'Not listed'}</Text>

            <Text style={styles.sectionLabel}>Special Services</Text>
            <Text style={styles.sectionValue}>{supplier.supplierSpecialServices.join(', ') || 'Not listed'}</Text>

            <Text style={styles.sectionLabel}>Custom Order Materials</Text>
            <Text style={styles.sectionValue}>{supplier.customOrderMaterials.join(', ') || 'Not listed'}</Text>

            {supplier.leadTimeDetails ? (
              <>
                <Text style={styles.sectionLabel}>Lead Time</Text>
                <Text style={styles.sectionValue}>{supplier.leadTimeDetails}</Text>
              </>
            ) : null}

            {supplier.minimumOrderQuantities ? (
              <>
                <Text style={styles.sectionLabel}>Minimum Order Quantities</Text>
                <Text style={styles.sectionValue}>{supplier.minimumOrderQuantities}</Text>
              </>
            ) : null}

            {supplier.fabricationCapabilities ? (
              <>
                <Text style={styles.sectionLabel}>Fabrication Support</Text>
                <Text style={styles.sectionValue}>{supplier.fabricationCapabilities}</Text>
              </>
            ) : null}

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleCall(supplier.phone)}>
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleEmail(supplier.email)}>
                <Text style={styles.actionButtonText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 12,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  centerText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  errorCard: {
    backgroundColor: '#3f1d1d',
    borderColor: '#7f1d1d',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  errorTitle: {
    color: '#fecaca',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#fee2e2',
    marginTop: 6,
    marginBottom: 10,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#991b1b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: '#cbd5e1',
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
  },
  name: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
  },
  location: {
    color: '#f59e0b',
    marginTop: 4,
    marginBottom: 10,
    fontSize: 13,
  },
  description: {
    color: '#cbd5e1',
    marginBottom: 10,
    lineHeight: 19,
  },
  sectionLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  sectionValue: {
    color: '#e2e8f0',
    marginTop: 2,
    lineHeight: 19,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#f8fafc',
    fontWeight: '700',
  },
});
