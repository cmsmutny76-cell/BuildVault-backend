import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ApartmentUnit {
  id: string;
  unitNumber: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: 'occupied' | 'vacant' | 'turnover' | 'renovation';
  tenant?: string;
  leaseEnd?: string;
  monthlyRent: number;
  lastRenovated?: string;
}

interface ApartmentDashboardProps {
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

export default function ApartmentDashboard({ onBack, onNavigate }: ApartmentDashboardProps) {
  const [units, setUnits] = useState<ApartmentUnit[]>([
    {
      id: '1',
      unitNumber: '101',
      address: '456 Sunset Ave, Los Angeles, CA',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 950,
      status: 'occupied',
      tenant: 'John Smith',
      leaseEnd: '2026-08-15',
      monthlyRent: 2800,
      lastRenovated: '2024-03',
    },
    {
      id: '2',
      unitNumber: '102',
      address: '456 Sunset Ave, Los Angeles, CA',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 720,
      status: 'turnover',
      leaseEnd: '2026-03-05',
      monthlyRent: 2200,
      lastRenovated: '2023-11',
    },
    {
      id: '3',
      unitNumber: '203',
      address: '456 Sunset Ave, Los Angeles, CA',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1250,
      status: 'renovation',
      monthlyRent: 3500,
      lastRenovated: '2020-06',
    },
    {
      id: '4',
      unitNumber: '204',
      address: '456 Sunset Ave, Los Angeles, CA',
      bedrooms: 2,
      bathrooms: 1,
      sqft: 850,
      status: 'vacant',
      monthlyRent: 2600,
      lastRenovated: '2025-01',
    },
  ]);

  const [selectedUnit, setSelectedUnit] = useState<ApartmentUnit | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return '#4CAF50';
      case 'vacant': return '#2196F3';
      case 'turnover': return '#FF9800';
      case 'renovation': return '#F44336';
      default: return '#999999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'occupied': return 'Occupied';
      case 'vacant': return 'Available';
      case 'turnover': return 'Turnover';
      case 'renovation': return 'Renovating';
      default: return status;
    }
  };

  const getStatusStats = () => {
    return {
      total: units.length,
      occupied: units.filter(u => u.status === 'occupied').length,
      vacant: units.filter(u => u.status === 'vacant').length,
      turnover: units.filter(u => u.status === 'turnover').length,
      renovation: units.filter(u => u.status === 'renovation').length,
    };
  };

  const stats = getStatusStats();
  const occupancyRate = ((stats.occupied / stats.total) * 100).toFixed(1);
  const totalRevenue = units.filter(u => u.status === 'occupied').reduce((sum, u) => sum + u.monthlyRent, 0);

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80' }}
      style={styles.backgroundImage}
      blurRadius={5}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.9)']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back to Categories</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Apartment Management</Text>
            <Text style={styles.headerSubtitle}>
              Track unit status, manage turnovers, and coordinate renovations
            </Text>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Units</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{occupancyRate}%</Text>
                <Text style={styles.statLabel}>Occupancy</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${(totalRevenue / 1000).toFixed(1)}k</Text>
                <Text style={styles.statLabel}>Monthly Revenue</Text>
              </View>
            </View>

            {/* Status Breakdown */}
            <View style={styles.statusBreakdown}>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.statusLabel}>Occupied: {stats.occupied}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.statusLabel}>Turnover: {stats.turnover}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: '#2196F3' }]} />
                <Text style={styles.statusLabel}>Vacant: {stats.vacant}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: '#F44336' }]} />
                <Text style={styles.statusLabel}>Renovation: {stats.renovation}</Text>
              </View>
            </View>
          </View>

          {/* View Toggle */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Units</Text>
              <View style={styles.viewToggle}>
                <TouchableOpacity 
                  style={[styles.toggleButton, viewMode === 'grid' && styles.toggleButtonActive]}
                  onPress={() => setViewMode('grid')}
                >
                  <Text style={[styles.toggleText, viewMode === 'grid' && styles.toggleTextActive]}>Grid</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
                  onPress={() => setViewMode('list')}
                >
                  <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Units Display */}
            <View style={viewMode === 'grid' ? styles.unitsGrid : styles.unitsList}>
              {units.map((unit) => (
                <TouchableOpacity
                  key={unit.id}
                  style={viewMode === 'grid' ? styles.unitCardGrid : styles.unitCardList}
                  onPress={() => setSelectedUnit(unit)}
                >
                  <View style={styles.unitHeader}>
                    <Text style={styles.unitNumber}>Unit {unit.unitNumber}</Text>
                    <View style={[styles.unitStatusBadge, { backgroundColor: getStatusColor(unit.status) }]}>
                      <Text style={styles.unitStatusText}>{getStatusLabel(unit.status)}</Text>
                    </View>
                  </View>

                  <Text style={styles.unitSpecs}>
                    {unit.bedrooms}BR • {unit.bathrooms}BA • {unit.sqft} sq ft
                  </Text>

                  <Text style={styles.unitRent}>${unit.monthlyRent.toLocaleString()}/mo</Text>

                  {unit.tenant && (
                    <Text style={styles.unitTenant}>👤 {unit.tenant}</Text>
                  )}

                  {unit.leaseEnd && unit.status === 'occupied' && (
                    <Text style={styles.unitLease}>Lease ends: {unit.leaseEnd}</Text>
                  )}

                  {unit.status === 'turnover' && (
                    <Text style={styles.unitAlert}>⚠️ Requires turnover service</Text>
                  )}

                  {unit.status === 'renovation' && (
                    <Text style={styles.unitAlert}>🔧 Under renovation</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unit Management</Text>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => onNavigate('projectProfile')}
            >
              <Text style={styles.actionIcon}>🏠</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Unit Renovation</Text>
                <Text style={styles.actionDescription}>
                  Kitchen, bathroom, flooring, and full unit remodeling
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Quick Turnover', 'Paint, clean, repair, and make unit rent-ready')}
            >
              <Text style={styles.actionIcon}>⚡</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Quick Turnover Service</Text>
                <Text style={styles.actionDescription}>
                  Fast turnaround between tenants - paint, clean, repairs
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => onNavigate('contractorSearch')}
            >
              <Text style={styles.actionIcon}>🔍</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Find Contractors</Text>
                <Text style={styles.actionDescription}>
                  Connect with apartment renovation specialists
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Scheduling', 'Coordinate work to minimize tenant disruption')}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Schedule Coordination</Text>
                <Text style={styles.actionDescription}>
                  Plan work around tenant schedules and lease dates
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Turnover Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Turnover Specialties</Text>

            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>⚡</Text>
                <Text style={styles.featureTitle}>Express Turnover</Text>
                <Text style={styles.featureDescription}>
                  3-5 day turnaround for move-outs
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>🔇</Text>
                <Text style={styles.featureTitle}>Noise Management</Text>
                <Text style={styles.featureDescription}>
                  Work during approved hours
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>👥</Text>
                <Text style={styles.featureTitle}>Tenant Coordination</Text>
                <Text style={styles.featureDescription}>
                  Minimize disruption to neighbors
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>💰</Text>
                <Text style={styles.featureTitle}>Budget Planning</Text>
                <Text style={styles.featureDescription}>
                  Fixed-price turnover packages
                </Text>
              </View>
            </View>
          </View>

          {/* Common Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Services</Text>

            <View style={styles.serviceCard}>
              <Text style={styles.serviceIcon}>🎨</Text>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>Interior Painting</Text>
                <Text style={styles.serviceDescription}>Touch-ups to full repaints</Text>
              </View>
            </View>

            <View style={styles.serviceCard}>
              <Text style={styles.serviceIcon}>🚿</Text>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>Bathroom Updates</Text>
                <Text style={styles.serviceDescription}>Fixtures, tile, vanity upgrades</Text>
              </View>
            </View>

            <View style={styles.serviceCard}>
              <Text style={styles.serviceIcon}>🍳</Text>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>Kitchen Refresh</Text>
                <Text style={styles.serviceDescription}>Cabinets, counters, appliances</Text>
              </View>
            </View>

            <View style={styles.serviceCard}>
              <Text style={styles.serviceIcon}>🪟</Text>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>Flooring</Text>
                <Text style={styles.serviceDescription}>Carpet, vinyl, hardwood, tile</Text>
              </View>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              💡 Need fast turnovers? Find contractors who specialize in quick apartment renovations with minimal downtime.
            </Text>
          </View>
        </ScrollView>

        {/* Unit Detail Modal */}
        {selectedUnit && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSelectedUnit(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Unit {selectedUnit.unitNumber}</Text>
                    <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedUnit.status) }]}>
                      <Text style={styles.modalStatusText}>{getStatusLabel(selectedUnit.status)}</Text>
                    </View>
                  </View>

                  <Text style={styles.modalAddress}>{selectedUnit.address}</Text>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Unit Details</Text>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Bedrooms:</Text>
                      <Text style={styles.modalDetailValue}>{selectedUnit.bedrooms}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Bathrooms:</Text>
                      <Text style={styles.modalDetailValue}>{selectedUnit.bathrooms}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Square Feet:</Text>
                      <Text style={styles.modalDetailValue}>{selectedUnit.sqft}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Monthly Rent:</Text>
                      <Text style={styles.modalDetailValue}>${selectedUnit.monthlyRent.toLocaleString()}</Text>
                    </View>
                  </View>

                  {selectedUnit.tenant && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Current Tenant</Text>
                      <Text style={styles.modalDetailValue}>{selectedUnit.tenant}</Text>
                      {selectedUnit.leaseEnd && (
                        <Text style={styles.modalDetailLabel}>Lease ends: {selectedUnit.leaseEnd}</Text>
                      )}
                    </View>
                  )}

                  {selectedUnit.lastRenovated && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Last Renovated</Text>
                      <Text style={styles.modalDetailValue}>{selectedUnit.lastRenovated}</Text>
                    </View>
                  )}

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedUnit(null);
                      onNavigate('projectProfile');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Start Renovation Project</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedUnit(null);
                      onNavigate('contractorSearch');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Find Contractors</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButtonSecondary}
                    onPress={() => setSelectedUnit(null)}
                  >
                    <Text style={styles.modalButtonSecondaryText}>Close</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 22,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
  },
  statusBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 13,
    color: '#CCCCCC',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 3,
  },
  toggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#D4AF37',
  },
  toggleText: {
    fontSize: 13,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#000000',
  },
  unitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  unitsList: {
    flexDirection: 'column',
  },
  unitCardGrid: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    margin: '1%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  unitCardList: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  unitStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unitSpecs: {
    fontSize: 13,
    color: '#CCCCCC',
    marginBottom: 6,
  },
  unitRent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 6,
  },
  unitTenant: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 3,
  },
  unitLease: {
    fontSize: 11,
    color: '#999999',
  },
  unitAlert: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    marginTop: 3,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  actionDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 15,
    margin: '1%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  serviceIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#CCCCCC',
  },
  infoBanner: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  infoBannerText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#D4AF37',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalAddress: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: '#999999',
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  modalButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  modalButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonSecondaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
