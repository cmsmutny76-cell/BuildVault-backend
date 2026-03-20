import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Screen } from '../types/navigation';

interface LandscaperProfile {
  id: string;
  name: string;
  company: string;
  rating: number;
  reviews: number;
  specialties: string[];
  serviceArea: string[];
  yearsExperience: number;
  isAvailable: boolean;
  priceRange: 'budget' | 'moderate' | 'premium';
  certifications: string[];
  portfolioImages: string[];
}

interface LandscapingDashboardProps {
  onBack: () => void;
  onNavigate: (screen: Screen, params?: unknown) => void;
}

export default function LandscapingDashboard({ onBack, onNavigate }: LandscapingDashboardProps) {
  const [landscapers, setLandscapers] = useState<LandscaperProfile[]>([
    {
      id: '1',
      name: 'Miguel Rodriguez',
      company: 'Green Paradise Landscaping',
      rating: 4.9,
      reviews: 127,
      specialties: ['Landscape Design', 'Irrigation', 'Hardscaping', 'Tree Service'],
      serviceArea: ['Los Angeles', 'Beverly Hills', 'Santa Monica'],
      yearsExperience: 15,
      isAvailable: true,
      priceRange: 'premium',
      certifications: ['Licensed Irrigator', 'ISA Certified Arborist'],
      portfolioImages: ['https://images.unsplash.com/photo-1558904541-efa843a96f01', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b'],
    },
    {
      id: '2',
      name: 'David Chen',
      company: 'Eco-Smart Landscapes',
      rating: 4.8,
      reviews: 98,
      specialties: ['Drought-Tolerant Design', 'Native Plants', 'Smart Irrigation', 'Water Features'],
      serviceArea: ['Los Angeles', 'Pasadena', 'Glendale'],
      yearsExperience: 12,
      isAvailable: true,
      priceRange: 'moderate',
      certifications: ['Water Conservation Specialist', 'Organic Gardening'],
      portfolioImages: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae'],
    },
    {
      id: '3',
      name: 'Sarah Thompson',
      company: 'Premier Garden & Hardscape',
      rating: 4.7,
      reviews: 84,
      specialties: ['Paver Patios', 'Retaining Walls', 'Outdoor Kitchens', 'Fire Pits'],
      serviceArea: ['Los Angeles', 'Long Beach', 'Orange County'],
      yearsExperience: 10,
      isAvailable: false,
      priceRange: 'premium',
      certifications: ['Licensed Contractor', 'Hardscape Specialist'],
      portfolioImages: ['https://images.unsplash.com/photo-1592928302636-c83cf1e1c887'],
    },
    {
      id: '4',
      name: 'Juan Martinez',
      company: 'Budget-Friendly Yards',
      rating: 4.5,
      reviews: 156,
      specialties: ['Lawn Care', 'Trimming', 'Basic Planting', 'Cleanup'],
      serviceArea: ['Los Angeles', 'Compton', 'Inglewood'],
      yearsExperience: 7,
      isAvailable: true,
      priceRange: 'budget',
      certifications: ['Licensed & Insured'],
      portfolioImages: [],
    },
  ]);

  const [selectedLandscaper, setSelectedLandscaper] = useState<LandscaperProfile | null>(null);
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');

  const getPriceRangeLabel = (range: string) => {
    switch (range) {
      case 'budget': return '$';
      case 'moderate': return '$$';
      case 'premium': return '$$$';
      default: return '$$';
    }
  };

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

  const specialties = ['all', 'Landscape Design', 'Irrigation', 'Hardscaping', 'Lawn Care', 'Tree Service'];

  const filteredLandscapers = filterSpecialty === 'all' 
    ? landscapers 
    : landscapers.filter(l => l.specialties.some(s => s.includes(filterSpecialty)));

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80' }}
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
            <Text style={styles.headerTitle}>Landscaping Professionals</Text>
            <Text style={styles.headerSubtitle}>
              Find landscapers, designers, and hardscape specialists
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{landscapers.length}</Text>
              <Text style={styles.statLabel}>Landscapers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{landscapers.filter(l => l.isAvailable).length}</Text>
              <Text style={styles.statLabel}>Available Now</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(landscapers.reduce((sum, l) => sum + l.rating, 0) / landscapers.length).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filter by Specialty:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {specialties.map((specialty) => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.filterChip,
                    filterSpecialty === specialty && styles.filterChipActive
                  ]}
                  onPress={() => setFilterSpecialty(specialty)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterSpecialty === specialty && styles.filterChipTextActive
                  ]}>
                    {specialty === 'all' ? 'All' : specialty}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Landscaper Profiles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Landscapers</Text>

            {filteredLandscapers.map((landscaper) => (
              <TouchableOpacity
                key={landscaper.id}
                style={styles.profileCard}
                onPress={() => setSelectedLandscaper(landscaper)}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.profileAvatar}>
                    <Text style={styles.avatarText}>{landscaper.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{landscaper.name}</Text>
                    <Text style={styles.profileCompany}>{landscaper.company}</Text>
                    <View style={styles.profileRating}>
                      {renderStars(Math.floor(landscaper.rating))}
                      <Text style={styles.ratingText}>{landscaper.rating} ({landscaper.reviews} reviews)</Text>
                    </View>
                  </View>
                  {landscaper.isAvailable ? (
                    <View style={styles.availableBadge}>
                      <Text style={styles.availableText}>Available</Text>
                    </View>
                  ) : (
                    <View style={styles.busyBadge}>
                      <Text style={styles.busyText}>Busy</Text>
                    </View>
                  )}
                </View>

                <View style={styles.profileDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>💼</Text>
                    <Text style={styles.detailText}>{landscaper.yearsExperience} years experience</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>💰</Text>
                    <Text style={styles.detailText}>Price: {getPriceRangeLabel(landscaper.priceRange)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{landscaper.serviceArea.join(', ')}</Text>
                  </View>
                </View>

                <View style={styles.specialtiesContainer}>
                  <Text style={styles.specialtiesLabel}>Specialties:</Text>
                  <View style={styles.specialtiesTags}>
                    {landscaper.specialties.map((specialty, index) => (
                      <View key={index} style={styles.specialtyTag}>
                        <Text style={styles.specialtyText}>{specialty}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {landscaper.certifications.length > 0 && (
                  <View style={styles.certificationsRow}>
                    <Text style={styles.certIcon}>✓</Text>
                    <Text style={styles.certText}>{landscaper.certifications.join(' • ')}</Text>
                  </View>
                )}

                <View style={styles.profileActions}>
                  <TouchableOpacity 
                    style={styles.viewProfileButton}
                    onPress={() => setSelectedLandscaper(landscaper)}
                  >
                    <Text style={styles.viewProfileText}>View Full Profile →</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Landscaping Services</Text>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => onNavigate('projectProfile')}
            >
              <Text style={styles.actionIcon}>🌿</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>New Landscape Project</Text>
                <Text style={styles.actionDescription}>
                  Design, installation, and full landscape renovation
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Irrigation', 'Install or repair irrigation systems')}
            >
              <Text style={styles.actionIcon}>💧</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Irrigation Systems</Text>
                <Text style={styles.actionDescription}>
                  Smart irrigation, drip systems, and water management
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Hardscaping', 'Patios, walkways, and outdoor structures')}
            >
              <Text style={styles.actionIcon}>🪨</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Hardscaping</Text>
                <Text style={styles.actionDescription}>
                  Pavers, retaining walls, outdoor kitchens, and fire pits
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Tree Service', 'Pruning, removal, and arborist services')}
            >
              <Text style={styles.actionIcon}>🌳</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Tree Services</Text>
                <Text style={styles.actionDescription}>
                  Professional pruning, removal, and tree health care
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              💡 All landscapers are licensed, insured, and background-checked. Read reviews and view portfolios before hiring.
            </Text>
          </View>
        </ScrollView>

        {/* Landscaper Detail Modal */}
        {selectedLandscaper && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSelectedLandscaper(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalAvatar}>
                      <Text style={styles.modalAvatarText}>{selectedLandscaper.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.modalHeaderText}>
                      <Text style={styles.modalTitle}>{selectedLandscaper.name}</Text>
                      <Text style={styles.modalCompany}>{selectedLandscaper.company}</Text>
                      <View style={styles.modalRating}>
                        {renderStars(Math.floor(selectedLandscaper.rating))}
                        <Text style={styles.modalRatingText}>
                          {selectedLandscaper.rating} ({selectedLandscaper.reviews} reviews)
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>About</Text>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Experience:</Text>
                      <Text style={styles.modalDetailValue}>{selectedLandscaper.yearsExperience} years</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Price Range:</Text>
                      <Text style={styles.modalDetailValue}>{getPriceRangeLabel(selectedLandscaper.priceRange)}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Availability:</Text>
                      <Text style={[
                        styles.modalDetailValue,
                        { color: selectedLandscaper.isAvailable ? '#4CAF50' : '#FF9800' }
                      ]}>
                        {selectedLandscaper.isAvailable ? 'Available Now' : 'Currently Busy'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Service Areas</Text>
                    <Text style={styles.modalSectionText}>{selectedLandscaper.serviceArea.join(', ')}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Specialties</Text>
                    <View style={styles.modalSpecialties}>
                      {selectedLandscaper.specialties.map((specialty, index) => (
                        <View key={index} style={styles.modalSpecialtyTag}>
                          <Text style={styles.modalSpecialtyText}>{specialty}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {selectedLandscaper.certifications.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Certifications & Licenses</Text>
                      {selectedLandscaper.certifications.map((cert, index) => (
                        <Text key={index} style={styles.modalCertText}>✓ {cert}</Text>
                      ))}
                    </View>
                  )}

                  {selectedLandscaper.portfolioImages.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Portfolio</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedLandscaper.portfolioImages.map((image, index) => (
                          <ImageBackground
                            key={index}
                            source={{ uri: `${image}?w=300&q=80` }}
                            style={styles.portfolioImage}
                            imageStyle={{ borderRadius: 8 }}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      const landscaperId = selectedLandscaper.id;
                      const landscaperName = selectedLandscaper.name;
                      setSelectedLandscaper(null);
                      onNavigate('chat', { receiverId: landscaperId, contactName: landscaperName });
                    }}
                  >
                    <Text style={styles.modalButtonText}>Send Message</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      const landscaperId = selectedLandscaper.id;
                      setSelectedLandscaper(null);
                      onNavigate('newEstimate', { contractorId: landscaperId });
                    }}
                  >
                    <Text style={styles.modalButtonText}>Request Free Quote</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButtonSecondary}
                    onPress={() => setSelectedLandscaper(null)}
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
    marginBottom: 15,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  profileCompany: {
    fontSize: 14,
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
  specialtiesContainer: {
    marginBottom: 12,
  },
  specialtiesLabel: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 8,
  },
  specialtiesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  specialtyText: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '600',
  },
  certificationsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  certIcon: {
    fontSize: 14,
    color: '#4CAF50',
    marginRight: 6,
  },
  certText: {
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
  modalAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modalAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
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
  modalCompany: {
    fontSize: 15,
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
  modalSpecialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalSpecialtyTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  modalSpecialtyText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  modalCertText: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 6,
  },
  portfolioImage: {
    width: 150,
    height: 150,
    marginRight: 10,
    borderRadius: 8,
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
