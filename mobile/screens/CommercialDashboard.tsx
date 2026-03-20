import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Screen } from '../types/navigation';

interface Property {
  id: string;
  name: string;
  type: 'office' | 'retail' | 'warehouse' | 'restaurant' | 'mixed-use';
  address: string;
  sqft: number;
  activeProjects: number;
  status: 'active' | 'planning' | 'completed';
}

interface CommercialDashboardProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

export default function CommercialDashboard({ onBack, onNavigate }: CommercialDashboardProps) {
  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      name: 'Downtown Office Complex',
      type: 'office',
      address: '456 Business Blvd, Los Angeles, CA 90012',
      sqft: 25000,
      activeProjects: 1,
      status: 'active',
    },
    {
      id: '2',
      name: 'Retail Plaza',
      type: 'retail',
      address: '789 Shopping Center Dr, Glendale, CA 91204',
      sqft: 15000,
      activeProjects: 0,
      status: 'planning',
    },
  ]);

  const [showAddProperty, setShowAddProperty] = useState(false);

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'office': return '🏢';
      case 'retail': return '🏬';
      case 'warehouse': return '🏭';
      case 'restaurant': return '🍽️';
      case 'mixed-use': return '🏙️';
      default: return '🏢';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'planning': return '#FF9800';
      case 'completed': return '#2196F3';
      default: return '#999999';
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80' }}
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
            <Text style={styles.headerTitle}>Commercial Projects</Text>
            <Text style={styles.headerSubtitle}>
              Manage office, retail, and commercial construction projects
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
              <Text style={styles.statValue}>
                {properties.reduce((sum, p) => sum + p.activeProjects, 0)}
              </Text>
              <Text style={styles.statLabel}>Active Projects</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {properties.reduce((sum, p) => sum + p.sqft, 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Sq Ft</Text>
            </View>
          </View>

          {/* Properties List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Commercial Properties</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowAddProperty(true)}
              >
                <Text style={styles.addButtonText}>+ Add Property</Text>
              </TouchableOpacity>
            </View>

            {properties.map((property) => (
              <View key={property.id} style={styles.propertyCard}>
                <View style={styles.propertyHeader}>
                  <View style={styles.propertyTitleRow}>
                    <Text style={styles.propertyIcon}>{getPropertyTypeIcon(property.type)}</Text>
                    <View style={styles.propertyInfo}>
                      <Text style={styles.propertyName}>{property.name}</Text>
                      <Text style={styles.propertyType}>
                        {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { borderColor: getStatusColor(property.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(property.status) }]}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.propertyAddress}>{property.address}</Text>

                <View style={styles.propertyDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Square Footage:</Text>
                    <Text style={styles.detailValue}>{property.sqft.toLocaleString()} sq ft</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Active Projects:</Text>
                    <Text style={styles.detailValue}>{property.activeProjects}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => Alert.alert('Property Details', 'Full property management coming soon!')}
                >
                  <Text style={styles.viewButtonText}>View Details →</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => onNavigate('projectProfile')}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>New Commercial Project</Text>
                <Text style={styles.actionDescription}>
                  Start a new renovation, build-out, or construction project
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => onNavigate('contractorSearch')}
            >
              <Text style={styles.actionIcon}>🏗️</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Find Commercial Contractors</Text>
                <Text style={styles.actionDescription}>
                  Connect with licensed commercial construction professionals
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Coming Soon', 'Permit assistance for commercial projects')}
            >
              <Text style={styles.actionIcon}>📄</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Commercial Permits</Text>
                <Text style={styles.actionDescription}>
                  Get help with commercial building permits and inspections
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Coming Soon', 'Project timeline planning tools')}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Project Timeline</Text>
                <Text style={styles.actionDescription}>
                  Plan and track construction phases and deadlines
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Commercial-Specific Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commercial Features</Text>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🏛️</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>ADA Compliance</Text>
                <Text style={styles.featureDescription}>
                  Ensure your commercial space meets accessibility requirements
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🔥</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Fire & Safety Code</Text>
                <Text style={styles.featureDescription}>
                  Commercial fire suppression, sprinklers, and safety systems
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>⚡</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Commercial Electrical</Text>
                <Text style={styles.featureDescription}>
                  High-voltage systems, lighting, and power distribution
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>❄️</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>HVAC Systems</Text>
                <Text style={styles.featureDescription}>
                  Commercial heating, cooling, and ventilation solutions
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  propertyType: {
    fontSize: 14,
    color: '#D4AF37',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  propertyAddress: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  propertyDetails: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 20,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
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
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 18,
  },
});
