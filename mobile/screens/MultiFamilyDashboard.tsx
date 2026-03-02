import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MultiFamilyProperty {
  id: string;
  name: string;
  address: string;
  units: number;
  occupancyRate: number;
  activeProjects: number;
  sqft: number;
  yearBuilt: number;
  status: 'fully-leased' | 'available' | 'renovation';
  amenities: string[];
}

interface MultiFamilyDashboardProps {
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

export default function MultiFamilyDashboard({ onBack, onNavigate }: MultiFamilyDashboardProps) {
  const [properties, setProperties] = useState<MultiFamilyProperty[]>([
    {
      id: '1',
      name: 'Sunset Apartments',
      address: '1234 Residential Ave, Los Angeles, CA 90001',
      units: 48,
      occupancyRate: 95.8,
      activeProjects: 2,
      sqft: 45000,
      yearBuilt: 2015,
      status: 'fully-leased',
      amenities: ['Pool', 'Gym', 'Parking', 'Laundry'],
    },
    {
      id: '2',
      name: 'Garden View Complex',
      address: '5678 Park Street, Pasadena, CA 91101',
      units: 72,
      occupancyRate: 88.9,
      activeProjects: 1,
      sqft: 68000,
      yearBuilt: 2010,
      status: 'available',
      amenities: ['Pool', 'Playground', 'Parking', 'BBQ Area'],
    },
    {
      id: '3',
      name: 'Downtown Lofts',
      address: '910 Urban Blvd, Los Angeles, CA 90012',
      units: 36,
      occupancyRate: 72.2,
      activeProjects: 3,
      sqft: 42000,
      yearBuilt: 2008,
      status: 'renovation',
      amenities: ['Gym', 'Parking', 'Lounge'],
    },
  ]);

  const [selectedProperty, setSelectedProperty] = useState<MultiFamilyProperty | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fully-leased': return '#4CAF50';
      case 'available': return '#2196F3';
      case 'renovation': return '#FF9800';
      default: return '#999999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'fully-leased': return 'Fully Leased';
      case 'available': return 'Units Available';
      case 'renovation': return 'Under Renovation';
      default: return status;
    }
  };

  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const avgOccupancy = properties.reduce((sum, p) => sum + p.occupancyRate, 0) / properties.length;
  const totalSqft = properties.reduce((sum, p) => sum + p.sqft, 0);

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80' }}
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
            <Text style={styles.headerTitle}>Multi-Family Housing</Text>
            <Text style={styles.headerSubtitle}>
              Manage apartment complexes, amenities, and building systems
            </Text>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{properties.length}</Text>
              <Text style={styles.statLabel}>Properties</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalUnits}</Text>
              <Text style={styles.statLabel}>Total Units</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{avgOccupancy.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Avg Occupancy</Text>
            </View>
          </View>

          {/* Properties Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Properties</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.addButtonText}>+ Add Property</Text>
              </TouchableOpacity>
            </View>

            {properties.map((property) => (
              <TouchableOpacity
                key={property.id}
                style={styles.propertyCard}
                onPress={() => setSelectedProperty(property)}
              >
                <View style={styles.propertyHeader}>
                  <View style={styles.propertyTitleRow}>
                    <Text style={styles.propertyIcon}>🏘️</Text>
                    <View style={styles.propertyInfo}>
                      <Text style={styles.propertyName}>{property.name}</Text>
                      <Text style={styles.propertyAddress}>{property.address}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { borderColor: getStatusColor(property.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(property.status) }]}>
                      {getStatusLabel(property.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.propertyStats}>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxValue}>{property.units}</Text>
                    <Text style={styles.statBoxLabel}>Units</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxValue}>{property.occupancyRate}%</Text>
                    <Text style={styles.statBoxLabel}>Occupied</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxValue}>{property.activeProjects}</Text>
                    <Text style={styles.statBoxLabel}>Projects</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxValue}>{(property.sqft / 1000).toFixed(0)}k</Text>
                    <Text style={styles.statBoxLabel}>Sq Ft</Text>
                  </View>
                </View>

                <View style={styles.amenitiesRow}>
                  <Text style={styles.amenitiesLabel}>Amenities:</Text>
                  <Text style={styles.amenitiesText}>{property.amenities.join(' • ')}</Text>
                </View>

                <View style={styles.propertyFooter}>
                  <Text style={styles.yearBuilt}>Built {property.yearBuilt}</Text>
                  <Text style={styles.viewDetails}>View Details →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Management</Text>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => onNavigate('projectProfile')}
            >
              <Text style={styles.actionIcon}>🔧</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>New Renovation Project</Text>
                <Text style={styles.actionDescription}>
                  Start unit upgrades, common area improvements, or building systems
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Unit Management', 'Track unit status, tenants, and turnovers')}
            >
              <Text style={styles.actionIcon}>🏠</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Unit Management</Text>
                <Text style={styles.actionDescription}>
                  Monitor unit status, leases, and maintenance requests
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => onNavigate('contractorSearch')}
            >
              <Text style={styles.actionIcon}>👷</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Find Contractors</Text>
                <Text style={styles.actionDescription}>
                  Connect with multi-family housing specialists
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Maintenance', 'Schedule preventive and emergency maintenance')}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Maintenance Scheduling</Text>
                <Text style={styles.actionDescription}>
                  Plan preventive maintenance and coordinate repairs
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Multi-Family Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Building Systems & Features</Text>

            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>🏊</Text>
                <Text style={styles.featureTitle}>Common Areas</Text>
                <Text style={styles.featureDescription}>
                  Pool, gym, clubhouse, and shared spaces
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>🎯</Text>
                <Text style={styles.featureTitle}>Amenities</Text>
                <Text style={styles.featureDescription}>
                  Parking, laundry, storage, and recreation
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>🚗</Text>
                <Text style={styles.featureTitle}>Parking & Exterior</Text>
                <Text style={styles.featureDescription}>
                  Lots, garages, landscaping, and lighting
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>⚙️</Text>
                <Text style={styles.featureTitle}>Building Systems</Text>
                <Text style={styles.featureDescription}>
                  HVAC, plumbing, electrical, and security
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>🔒</Text>
                <Text style={styles.featureTitle}>Security</Text>
                <Text style={styles.featureDescription}>
                  Access control, cameras, and monitoring
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>♻️</Text>
                <Text style={styles.featureTitle}>Sustainability</Text>
                <Text style={styles.featureDescription}>
                  Energy efficiency and green upgrades
                </Text>
              </View>
            </View>
          </View>

          {/* Compliance & Analytics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Management Tools</Text>

            <View style={styles.toolCard}>
              <Text style={styles.toolIcon}>📊</Text>
              <View style={styles.toolContent}>
                <Text style={styles.toolTitle}>Portfolio Analytics</Text>
                <Text style={styles.toolDescription}>
                  Track occupancy rates, revenue, and operating expenses across all properties
                </Text>
              </View>
            </View>

            <View style={styles.toolCard}>
              <Text style={styles.toolIcon}>⚖️</Text>
              <View style={styles.toolContent}>
                <Text style={styles.toolTitle}>Compliance Management</Text>
                <Text style={styles.toolDescription}>
                  Stay compliant with housing codes, safety inspections, and HOA requirements
                </Text>
              </View>
            </View>

            <View style={styles.toolCard}>
              <Text style={styles.toolIcon}>📱</Text>
              <View style={styles.toolContent}>
                <Text style={styles.toolTitle}>Tenant Communication</Text>
                <Text style={styles.toolDescription}>
                  Send notifications, manage requests, and coordinate access
                </Text>
              </View>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              💡 Managing multi-family properties? Connect with contractors who specialize in large-scale housing projects and building systems.
            </Text>
          </View>
        </ScrollView>

        {/* Property Detail Modal */}
        {selectedProperty && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSelectedProperty(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView>
                  <Text style={styles.modalTitle}>{selectedProperty.name}</Text>
                  <Text style={styles.modalSubtitle}>{selectedProperty.address}</Text>

                  <View style={styles.modalStats}>
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Total Units</Text>
                      <Text style={styles.modalStatValue}>{selectedProperty.units}</Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Occupancy Rate</Text>
                      <Text style={styles.modalStatValue}>{selectedProperty.occupancyRate}%</Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Square Footage</Text>
                      <Text style={styles.modalStatValue}>{selectedProperty.sqft.toLocaleString()}</Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Year Built</Text>
                      <Text style={styles.modalStatValue}>{selectedProperty.yearBuilt}</Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Active Projects</Text>
                    <Text style={styles.modalSectionValue}>{selectedProperty.activeProjects} ongoing renovations</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Amenities</Text>
                    {selectedProperty.amenities.map((amenity, index) => (
                      <Text key={index} style={styles.modalAmenity}>✓ {amenity}</Text>
                    ))}
                  </View>

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedProperty(null);
                      onNavigate('projectProfile');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Start New Project</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButtonSecondary}
                    onPress={() => setSelectedProperty(null)}
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
  addButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  propertyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  propertyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  propertyIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  propertyAddress: {
    fontSize: 13,
    color: '#CCCCCC',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  propertyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 3,
  },
  statBoxLabel: {
    fontSize: 11,
    color: '#999999',
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  amenitiesLabel: {
    fontSize: 13,
    color: '#999999',
    marginRight: 8,
  },
  amenitiesText: {
    fontSize: 13,
    color: '#CCCCCC',
    flex: 1,
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  yearBuilt: {
    fontSize: 13,
    color: '#999999',
  },
  viewDetails: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
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
  toolCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toolIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  toolDescription: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 18,
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  modalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  modalStatItem: {
    width: '50%',
    marginBottom: 15,
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 3,
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
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
  modalSectionValue: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  modalAmenity: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
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
