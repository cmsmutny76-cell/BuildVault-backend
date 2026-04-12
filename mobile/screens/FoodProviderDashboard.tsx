import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Alert, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MobileScreenHeader from '../components/MobileScreenHeader';

interface FoodVendorProfile {
  id: string;
  name: string;
  businessName: string;
  rating: number;
  reviews: number;
  cuisine: string[];
  serviceType: string[];
  serviceArea: string[];
  minOrder: number;
  pricePerPerson: string;
  setupTime: string;
  isAvailable: boolean;
  certifications: string[];
  specialDiets: string[];
}

interface FoodProviderDashboardProps {
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

export default function FoodProviderDashboard({ onBack, onNavigate }: FoodProviderDashboardProps) {
  const [vendors, setVendors] = useState<FoodVendorProfile[]>([
    {
      id: '1',
      name: 'Maria Gonzalez',
      businessName: 'Construction Eats Food Truck',
      rating: 4.9,
      reviews: 243,
      cuisine: ['Mexican', 'American', 'BBQ'],
      serviceType: ['Food Truck', 'On-Site Catering', 'Box Lunches'],
      serviceArea: ['Los Angeles', 'Orange County', 'Ventura County'],
      minOrder: 10,
      pricePerPerson: '$12-$18',
      setupTime: '30 min',
      isAvailable: true,
      certifications: ['Health Permit', 'Food Handler Certified', 'Insured'],
      specialDiets: ['Vegetarian', 'Gluten-Free Options'],
    },
    {
      id: '2',
      name: 'Tony Romano',
      businessName: 'Site Chef Catering',
      rating: 4.8,
      reviews: 187,
      cuisine: ['Italian', 'Mediterranean', 'Sandwiches'],
      serviceType: ['Full Catering', 'Buffet Setup', 'Individual Meals'],
      serviceArea: ['Los Angeles', 'Pasadena', 'Burbank'],
      minOrder: 15,
      pricePerPerson: '$15-$22',
      setupTime: '45 min',
      isAvailable: true,
      certifications: ['Health Permit', 'ServSafe Certified', 'Licensed Caterer'],
      specialDiets: ['Vegetarian', 'Vegan', 'Keto'],
    },
    {
      id: '3',
      name: 'Kim Chen',
      businessName: 'Quick Bites Construction Catering',
      rating: 4.7,
      reviews: 156,
      cuisine: ['Asian Fusion', 'American', 'Wraps & Bowls'],
      serviceType: ['Food Truck', 'Drop-Off Catering', 'Box Lunches'],
      serviceArea: ['Los Angeles', 'Long Beach', 'Downey'],
      minOrder: 8,
      pricePerPerson: '$10-$16',
      setupTime: '20 min',
      isAvailable: false,
      certifications: ['Health Permit', 'Food Handler Certified'],
      specialDiets: ['Vegetarian', 'Gluten-Free', 'Dairy-Free'],
    },
    {
      id: '4',
      name: 'James Walker',
      businessName: 'Budget Job Site Meals',
      rating: 4.5,
      reviews: 298,
      cuisine: ['American', 'Burgers', 'Sandwiches'],
      serviceType: ['Food Truck', 'Box Lunches'],
      serviceArea: ['Los Angeles', 'Inglewood', 'Compton'],
      minOrder: 5,
      pricePerPerson: '$8-$12',
      setupTime: '15 min',
      isAvailable: true,
      certifications: ['Health Permit', 'Insured'],
      specialDiets: ['Vegetarian Options'],
    },
  ]);

  const [selectedVendor, setSelectedVendor] = useState<FoodVendorProfile | null>(null);
  const [filterCuisine, setFilterCuisine] = useState<string>('all');

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= rating ? '⭐' : '☆'}
        </Text>
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  const cuisines = ['all', 'Mexican', 'American', 'Italian', 'Asian Fusion', 'BBQ'];

  const filteredVendors = filterCuisine === 'all' 
    ? vendors 
    : vendors.filter(v => v.cuisine.includes(filterCuisine));

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80' }}
      style={styles.backgroundImage}
      blurRadius={5}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.9)']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <MobileScreenHeader
            onBack={onBack}
            backLabel="← Back to Categories"
            title="Construction Site Catering"
            subtitle="Food trucks and catering services for job sites and crews"
            theme="dark"
          />

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{vendors.length}</Text>
              <Text style={styles.statLabel}>Food Providers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{vendors.filter(v => v.isAvailable).length}</Text>
              <Text style={styles.statLabel}>Available Today</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filter by Cuisine:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {cuisines.map((cuisine) => (
                <TouchableOpacity
                  key={cuisine}
                  style={[
                    styles.filterChip,
                    filterCuisine === cuisine && styles.filterChipActive
                  ]}
                  onPress={() => setFilterCuisine(cuisine)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterCuisine === cuisine && styles.filterChipTextActive
                  ]}>
                    {cuisine === 'all' ? 'All' : cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Vendor Profiles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Vendors</Text>

            {filteredVendors.map((vendor) => (
              <TouchableOpacity
                key={vendor.id}
                style={styles.profileCard}
                onPress={() => setSelectedVendor(vendor)}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.profileAvatar}>
                    <Text style={styles.avatarEmoji}>🍽️</Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileBusiness}>{vendor.businessName}</Text>
                    <Text style={styles.profileName}>By {vendor.name}</Text>
                    <View style={styles.profileRating}>
                      {renderStars(Math.floor(vendor.rating))}
                      <Text style={styles.ratingText}>{vendor.rating} ({vendor.reviews} reviews)</Text>
                    </View>
                  </View>
                  {vendor.isAvailable ? (
                    <View style={styles.availableBadge}>
                      <Text style={styles.availableText}>Available</Text>
                    </View>
                  ) : (
                    <View style={styles.busyBadge}>
                      <Text style={styles.busyText}>Booked</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cuisineRow}>
                  <Text style={styles.cuisineLabel}>Cuisine:</Text>
                  <Text style={styles.cuisineText}>{vendor.cuisine.join(', ')}</Text>
                </View>

                <View style={styles.profileDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>💰</Text>
                    <Text style={styles.detailText}>{vendor.pricePerPerson} per person</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>👥</Text>
                    <Text style={styles.detailText}>Min. Order: {vendor.minOrder} people</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>⏱️</Text>
                    <Text style={styles.detailText}>Setup: {vendor.setupTime}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{vendor.serviceArea.join(', ')}</Text>
                  </View>
                </View>

                <View style={styles.serviceTypesContainer}>
                  <Text style={styles.serviceTypesLabel}>Service Types:</Text>
                  <View style={styles.serviceTypesTags}>
                    {vendor.serviceType.map((type, index) => (
                      <View key={index} style={styles.serviceTypeTag}>
                        <Text style={styles.serviceTypeText}>{type}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {vendor.specialDiets.length > 0 && (
                  <View style={styles.dietRow}>
                    <Text style={styles.dietIcon}>✓</Text>
                    <Text style={styles.dietText}>Dietary Options: {vendor.specialDiets.join(', ')}</Text>
                  </View>
                )}

                <View style={styles.profileActions}>
                  <TouchableOpacity 
                    style={styles.viewProfileButton}
                    onPress={() => setSelectedVendor(vendor)}
                  >
                    <Text style={styles.viewProfileText}>View Menu & Details →</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catering Options</Text>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Daily Meals', 'Schedule recurring meals for your crew')}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Daily Job Site Meals</Text>
                <Text style={styles.actionDescription}>
                  Schedule regular breakfast or lunch service for your crew
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Events', 'Catering for company meetings and events')}
            >
              <Text style={styles.actionIcon}>🎉</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Special Event Catering</Text>
                <Text style={styles.actionDescription}>
                  Grand openings, safety meetings, and company celebrations
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Food Truck', 'Request on-site food truck service')}
            >
              <Text style={styles.actionIcon}>🚚</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Food Truck Service</Text>
                <Text style={styles.actionDescription}>
                  Mobile food trucks that come to your construction site
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Box Lunches', 'Individual meal packages for crews')}
            >
              <Text style={styles.actionIcon}>📦</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Box Lunch Service</Text>
                <Text style={styles.actionDescription}>
                  Pre-packaged individual meals delivered to your site
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Benefits Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why Use Construction Catering?</Text>

            <View style={styles.benefitCard}>
              <Text style={styles.benefitIcon}>⏰</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Save Time</Text>
                <Text style={styles.benefitDescription}>
                  Keep your crew on-site instead of leaving for lunch breaks
                </Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <Text style={styles.benefitIcon}>💪</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Boost Morale</Text>
                <Text style={styles.benefitDescription}>
                  Hot meals improve worker satisfaction and productivity
                </Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <Text style={styles.benefitIcon}>💵</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Cost Effective</Text>
                <Text style={styles.benefitDescription}>
                  Bulk pricing often cheaper than individual restaurant visits
                </Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <Image
                source={require('../assets/splash-icon.png')}
                style={styles.brandBenefitIcon}
                resizeMode="contain"
              />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Job Site Friendly</Text>
                <Text style={styles.benefitDescription}>
                  Vendors experienced with construction site logistics and requirements
                </Text>
              </View>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              💡 All food vendors are health-certified and experienced with construction site service. Most offer same-day or next-day availability.
            </Text>
          </View>
        </ScrollView>

        {/* Vendor Detail Modal */}
        {selectedVendor && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSelectedVendor(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalEmoji}>🍽️</Text>
                    <View style={styles.modalHeaderText}>
                      <Text style={styles.modalTitle}>{selectedVendor.businessName}</Text>
                      <Text style={styles.modalSubtitle}>By {selectedVendor.name}</Text>
                      <View style={styles.modalRating}>
                        {renderStars(Math.floor(selectedVendor.rating))}
                        <Text style={styles.modalRatingText}>
                          {selectedVendor.rating} ({selectedVendor.reviews} reviews)
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Pricing & Details</Text>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Price Range:</Text>
                      <Text style={styles.modalDetailValue}>{selectedVendor.pricePerPerson} per person</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Minimum Order:</Text>
                      <Text style={styles.modalDetailValue}>{selectedVendor.minOrder} people</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Setup Time:</Text>
                      <Text style={styles.modalDetailValue}>{selectedVendor.setupTime}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Availability:</Text>
                      <Text style={[
                        styles.modalDetailValue,
                        { color: selectedVendor.isAvailable ? '#4CAF50' : '#FF9800' }
                      ]}>
                        {selectedVendor.isAvailable ? 'Available Today' : 'Currently Booked'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Cuisine Types</Text>
                    <Text style={styles.modalSectionText}>{selectedVendor.cuisine.join(', ')}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Service Types</Text>
                    <View style={styles.modalServiceTypes}>
                      {selectedVendor.serviceType.map((type, index) => (
                        <View key={index} style={styles.modalServiceTypeTag}>
                          <Text style={styles.modalServiceTypeText}>{type}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Service Areas</Text>
                    <Text style={styles.modalSectionText}>{selectedVendor.serviceArea.join(', ')}</Text>
                  </View>

                  {selectedVendor.specialDiets.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Dietary Options</Text>
                      {selectedVendor.specialDiets.map((diet, index) => (
                        <Text key={index} style={styles.modalDietText}>✓ {diet}</Text>
                      ))}
                    </View>
                  )}

                  {selectedVendor.certifications.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Certifications</Text>
                      {selectedVendor.certifications.map((cert, index) => (
                        <Text key={index} style={styles.modalCertText}>✓ {cert}</Text>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedVendor(null);
                      Alert.alert('Request Quote', `Get pricing from ${selectedVendor.businessName}`);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Request Quote</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedVendor(null);
                      Alert.alert('Schedule', 'Book catering service');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Schedule Catering</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButtonSecondary}
                    onPress={() => setSelectedVendor(null)}
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
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 10,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  filterChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  filterChipText: {
    color: '#CCCCCC',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#000000',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  profileInfo: {
    flex: 1,
  },
  profileBusiness: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  profileName: {
    fontSize: 13,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  profileRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    marginRight: 5,
  },
  star: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 5,
  },
  availableBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  availableText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  busyBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  busyText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cuisineRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cuisineLabel: {
    fontSize: 13,
    color: '#999999',
    marginRight: 8,
  },
  cuisineText: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '600',
    flex: 1,
  },
  profileDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#CCCCCC',
  },
  serviceTypesContainer: {
    marginBottom: 12,
  },
  serviceTypesLabel: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 8,
  },
  serviceTypesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceTypeTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  serviceTypeText: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '600',
  },
  dietRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dietIcon: {
    fontSize: 14,
    color: '#4CAF50',
    marginRight: 6,
  },
  dietText: {
    fontSize: 12,
    color: '#4CAF50',
    flex: 1,
  },
  profileActions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  viewProfileButton: {
    alignItems: 'center',
  },
  viewProfileText: {
    color: '#D4AF37',
    fontSize: 14,
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
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  benefitIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  brandBenefitIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  benefitDescription: {
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
  modalHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modalEmoji: {
    fontSize: 50,
    marginRight: 15,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRatingText: {
    fontSize: 13,
    color: '#CCCCCC',
    marginLeft: 8,
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
  modalSectionText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
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
  modalServiceTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalServiceTypeTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  modalServiceTypeText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  modalDietText: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 6,
  },
  modalCertText: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 6,
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
