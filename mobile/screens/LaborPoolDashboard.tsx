import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MobileScreenHeader from '../components/MobileScreenHeader';

interface Worker {
  id: string;
  name: string;
  trade: string;
  skills: string[];
  experience: string;
  hourlyRate: string;
  availability: 'available' | 'working' | 'unavailable';
  rating: number;
  reviews: number;
  location: string;
  languages: string[];
  certifications: string[];
  hasTruck: boolean;
  hasTools: boolean;
  minDays: number;
  lastWorked: string;
}

interface LaborPoolDashboardProps {
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

export default function LaborPoolDashboard({ onBack, onNavigate }: LaborPoolDashboardProps) {
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: '1',
      name: 'Miguel Santos',
      trade: 'General Labor',
      skills: ['Demolition', 'Cleanup', 'Material Handling', 'Digging'],
      experience: '8 years',
      hourlyRate: '$22/hr',
      availability: 'available',
      rating: 4.8,
      reviews: 64,
      location: 'Los Angeles, CA',
      languages: ['English', 'Spanish'],
      certifications: ['OSHA 10', 'Forklift'],
      hasTruck: false,
      hasTools: true,
      minDays: 1,
      lastWorked: '2 days ago'
    },
    {
      id: '2',
      name: 'James Wilson',
      trade: 'Carpenter Helper',
      skills: ['Framing', 'Material Prep', 'Tool Handling', 'Cleanup'],
      experience: '4 years',
      hourlyRate: '$20/hr',
      availability: 'available',
      rating: 4.6,
      reviews: 42,
      location: 'Long Beach, CA',
      languages: ['English'],
      certifications: ['OSHA 10'],
      hasTruck: true,
      hasTools: true,
      minDays: 2,
      lastWorked: '1 week ago'
    },
    {
      id: '3',
      name: 'Carlos Rodriguez',
      trade: 'Concrete Labor',
      skills: ['Concrete Finish', 'Formwork', 'Rebar Tying', 'Grading'],
      experience: '12 years',
      hourlyRate: '$28/hr',
      availability: 'working',
      rating: 4.9,
      reviews: 93,
      location: 'Pasadena, CA',
      languages: ['English', 'Spanish'],
      certifications: ['OSHA 30', 'Flatwork Specialist'],
      hasTruck: true,
      hasTools: true,
      minDays: 3,
      lastWorked: 'Currently working'
    },
    {
      id: '4',
      name: 'David Kim',
      trade: 'Painter Helper',
      skills: ['Surface Prep', 'Masking', 'Cleanup', 'Material Handling'],
      experience: '3 years',
      hourlyRate: '$18/hr',
      availability: 'available',
      rating: 4.5,
      reviews: 28,
      location: 'Koreatown, CA',
      languages: ['English', 'Korean'],
      certifications: ['Lead-Safe Cert'],
      hasTruck: false,
      hasTools: false,
      minDays: 1,
      lastWorked: '3 days ago'
    },
    {
      id: '5',
      name: 'Robert Johnson',
      trade: 'Electrical Helper',
      skills: ['Cable Pulling', 'Conduit Bending', 'Tool Handling', 'Cleanup'],
      experience: '2 years',
      hourlyRate: '$19/hr',
      availability: 'available',
      rating: 4.7,
      reviews: 31,
      location: 'Burbank, CA',
      languages: ['English'],
      certifications: ['OSHA 10', 'First Aid'],
      hasTruck: false,
      hasTools: true,
      minDays: 1,
      lastWorked: '4 days ago'
    },
    {
      id: '6',
      name: 'Antonio Martinez',
      trade: 'Landscaping Labor',
      skills: ['Sod Install', 'Plant Installation', 'Irrigation', 'Hardscape'],
      experience: '6 years',
      hourlyRate: '$21/hr',
      availability: 'available',
      rating: 4.8,
      reviews: 57,
      location: 'Santa Monica, CA',
      languages: ['English', 'Spanish'],
      certifications: ['Pesticide Applicator', 'OSHA 10'],
      hasTruck: true,
      hasTools: true,
      minDays: 2,
      lastWorked: '1 week ago'
    },
    {
      id: '7',
      name: 'Marcus Thompson',
      trade: 'Roofing Labor',
      skills: ['Material Handling', 'Tear-off', 'Cleanup', 'Safety'],
      experience: '5 years',
      hourlyRate: '$23/hr',
      availability: 'available',
      rating: 4.6,
      reviews: 48,
      location: 'Inglewood, CA',
      languages: ['English'],
      certifications: ['OSHA 10', 'Fall Protection'],
      hasTruck: false,
      hasTools: true,
      minDays: 1,
      lastWorked: '5 days ago'
    },
    {
      id: '8',
      name: 'Jose Hernandez',
      trade: 'Plumbing Helper',
      skills: ['Pipe Prep', 'Trenching', 'Material Handling', 'Cleanup'],
      experience: '7 years',
      hourlyRate: '$24/hr',
      availability: 'unavailable',
      rating: 4.9,
      reviews: 71,
      location: 'Downey, CA',
      languages: ['English', 'Spanish'],
      certifications: ['OSHA 10', 'Confined Space'],
      hasTruck: true,
      hasTools: true,
      minDays: 3,
      lastWorked: '2 weeks ago'
    },
  ]);

  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [filterTrade, setFilterTrade] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return '#4CAF50';
      case 'working': return '#FF9800';
      case 'unavailable': return '#999999';
      default: return '#999999';
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available Now';
      case 'working': return 'Currently Working';
      case 'unavailable': return 'Unavailable';
      default: return availability;
    }
  };

  const trades = ['all', 'General Labor', 'Carpenter Helper', 'Concrete Labor', 'Painter Helper', 'Electrical Helper', 'Landscaping Labor', 'Roofing Labor', 'Plumbing Helper'];

  const filteredWorkers = workers.filter(w => {
    const tradeMatch = filterTrade === 'all' || w.trade === filterTrade;
    const availMatch = filterAvailability === 'all' || w.availability === filterAvailability;
    return tradeMatch && availMatch;
  });

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80' }}
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
            title="Labor Pool"
            subtitle="Temp workers and day labor for immediate hire"
            theme="dark"
          />

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workers.length}</Text>
              <Text style={styles.statLabel}>Total Workers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workers.filter(w => w.availability === 'available').length}</Text>
              <Text style={styles.statLabel}>Available Today</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(workers.reduce((sum, w) => sum + w.rating, 0) / workers.length).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>

          {/* How It Works */}
          <View style={styles.howItWorks}>
            <Text style={styles.howItWorksTitle}>How Temp Labor Works</Text>
            <View style={styles.stepContainer}>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>Browse available workers by trade & skills</Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>Check availability & hourly rates</Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>Contact worker directly for immediate hire</Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepText}>Pay by the day or week - flexible terms</Text>
              </View>
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filter by Availability:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, filterAvailability === 'all' && styles.filterChipActive]}
                onPress={() => setFilterAvailability('all')}
              >
                <Text style={[styles.filterChipText, filterAvailability === 'all' && styles.filterChipTextActive]}>
                  All Workers
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterAvailability === 'available' && styles.filterChipActive]}
                onPress={() => setFilterAvailability('available')}
              >
                <Text style={[styles.filterChipText, filterAvailability === 'available' && styles.filterChipTextActive]}>
                  Available Now
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterAvailability === 'working' && styles.filterChipActive]}
                onPress={() => setFilterAvailability('working')}
              >
                <Text style={[styles.filterChipText, filterAvailability === 'working' && styles.filterChipTextActive]}>
                  Currently Working
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filter by Trade:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {trades.map((trade) => (
                <TouchableOpacity
                  key={trade}
                  style={[styles.filterChip, filterTrade === trade && styles.filterChipActive]}
                  onPress={() => setFilterTrade(trade)}
                >
                  <Text style={[styles.filterChipText, filterTrade === trade && styles.filterChipTextActive]}>
                    {trade === 'all' ? 'All Trades' : trade}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Worker Listings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Workers ({filteredWorkers.length})</Text>

            {filteredWorkers.map((worker) => (
              <TouchableOpacity
                key={worker.id}
                style={styles.workerCard}
                onPress={() => setSelectedWorker(worker)}
              >
                <View style={styles.workerHeader}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{worker.name.split(' ').map(n => n[0]).join('')}</Text>
                    </View>
                    <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor(worker.availability) }]} />
                  </View>

                  <View style={styles.workerInfo}>
                    <Text style={styles.workerName}>{worker.name}</Text>
                    <Text style={styles.workerTrade}>{worker.trade}</Text>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.stars}>{renderStars(worker.rating)}</Text>
                      <Text style={styles.ratingText}>{worker.rating} ({worker.reviews} reviews)</Text>
                    </View>
                  </View>

                  <View style={styles.rateContainer}>
                    <Text style={styles.rateAmount}>{worker.hourlyRate}</Text>
                    <Text style={styles.rateLabel}>per hour</Text>
                  </View>
                </View>

                <View style={styles.workerDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{worker.location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🛠️</Text>
                    <Text style={styles.detailText}>{worker.experience} experience</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📅</Text>
                    <Text style={styles.detailText}>Min {worker.minDays} day{worker.minDays > 1 ? 's' : ''}</Text>
                  </View>
                </View>

                <View style={styles.skillsContainer}>
                  <Text style={styles.skillsLabel}>Skills:</Text>
                  <View style={styles.skillsList}>
                    {worker.skills.slice(0, 4).map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.workerFooter}>
                  <View style={styles.badgesContainer}>
                    {worker.hasTruck && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>🚚 Has Truck</Text>
                      </View>
                    )}
                    {worker.hasTools && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>🔧 Has Tools</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.availabilityBadge, { backgroundColor: getAvailabilityColor(worker.availability) }]}>
                    <Text style={styles.availabilityText}>{getAvailabilityLabel(worker.availability)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Benefits Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why Use Temp Labor?</Text>

            <View style={styles.benefitCard}>
              <Text style={styles.benefitIcon}>⚡</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Immediate Availability</Text>
                <Text style={styles.benefitDescription}>
                  Hire workers on short notice for urgent projects
                </Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <Text style={styles.benefitIcon}>💰</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Flexible Cost Structure</Text>
                <Text style={styles.benefitDescription}>
                  Pay by the hour, day, or week - no long-term commitment
                </Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <Text style={styles.benefitIcon}>🎯</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Skilled Workers</Text>
                <Text style={styles.benefitDescription}>
                  Vetted workers with experience and certifications
                </Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <Text style={styles.benefitIcon}>📈</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Scale Your Crew</Text>
                <Text style={styles.benefitDescription}>
                  Add workers during busy periods, scale down when slow
                </Text>
              </View>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              💡 All workers are background checked and carry worker's compensation insurance. Direct hire available for exceptional performers.
            </Text>
          </View>
        </ScrollView>

        {/* Worker Detail Modal */}
        {selectedWorker && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSelectedWorker(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>
                      {selectedWorker.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>

                  <Text style={styles.modalName}>{selectedWorker.name}</Text>
                  <Text style={styles.modalTrade}>{selectedWorker.trade}</Text>

                  <View style={styles.modalRating}>
                    <Text style={styles.modalStars}>{renderStars(selectedWorker.rating)}</Text>
                    <Text style={styles.modalRatingText}>
                      {selectedWorker.rating} ({selectedWorker.reviews} reviews)
                    </Text>
                  </View>

                  <View style={[styles.modalAvailabilityBanner, { backgroundColor: getAvailabilityColor(selectedWorker.availability) }]}>
                    <Text style={styles.modalAvailabilityText}>
                      {getAvailabilityLabel(selectedWorker.availability)}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Rates & Availability</Text>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Hourly Rate:</Text>
                      <Text style={styles.modalDetailValue}>{selectedWorker.hourlyRate}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Min Commitment:</Text>
                      <Text style={styles.modalDetailValue}>{selectedWorker.minDays} day(s)</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Last Worked:</Text>
                      <Text style={styles.modalDetailValue}>{selectedWorker.lastWorked}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Location:</Text>
                      <Text style={styles.modalDetailValue}>{selectedWorker.location}</Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Experience</Text>
                    <Text style={styles.modalText}>{selectedWorker.experience} in {selectedWorker.trade}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Skills</Text>
                    <View style={styles.modalSkillsGrid}>
                      {selectedWorker.skills.map((skill, index) => (
                        <View key={index} style={styles.modalSkillTag}>
                          <Text style={styles.modalSkillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Certifications</Text>
                    {selectedWorker.certifications.map((cert, index) => (
                      <Text key={index} style={styles.modalListItem}>✓ {cert}</Text>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Languages</Text>
                    <Text style={styles.modalText}>{selectedWorker.languages.join(', ')}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Equipment</Text>
                    <View style={styles.modalEquipment}>
                      <Text style={styles.modalEquipmentItem}>
                        🚚 Own Truck: {selectedWorker.hasTruck ? 'Yes' : 'No'}
                      </Text>
                      <Text style={styles.modalEquipmentItem}>
                        🔧 Own Tools: {selectedWorker.hasTools ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.modalButton, selectedWorker.availability !== 'available' && styles.modalButtonDisabled]}
                    onPress={() => {
                      if (selectedWorker.availability === 'available') {
                        setSelectedWorker(null);
                        Alert.alert('Hire Worker', `Contact ${selectedWorker.name} for immediate hire`);
                      } else {
                        Alert.alert('Not Available', 'This worker is currently unavailable');
                      }
                    }}
                  >
                    <Text style={styles.modalButtonText}>
                      {selectedWorker.availability === 'available' ? 'Hire Now' : 'Not Available'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedWorker(null);
                      Alert.alert('Message', `Send message to ${selectedWorker.name}`);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Send Message</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButtonSecondary}
                    onPress={() => setSelectedWorker(null)}
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
  howItWorks: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 15,
  },
  stepContainer: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D4AF37',
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 15,
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
  workerCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  workerHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  availabilityDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workerTrade: {
    fontSize: 13,
    color: '#CCCCCC',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    fontSize: 14,
    color: '#FFD700',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  rateContainer: {
    alignItems: 'flex-end',
  },
  rateAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  rateLabel: {
    fontSize: 11,
    color: '#999999',
  },
  workerDetails: {
    marginBottom: 15,
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
    flex: 1,
  },
  skillsContainer: {
    marginBottom: 15,
  },
  skillsLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  skillText: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '600',
  },
  workerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  availabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
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
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },
  modalAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalTrade: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalStars: {
    fontSize: 16,
    color: '#FFD700',
    marginRight: 8,
  },
  modalRatingText: {
    fontSize: 13,
    color: '#CCCCCC',
  },
  modalAvailabilityBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalAvailabilityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
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
  modalText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  modalSkillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalSkillTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  modalSkillText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  modalListItem: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 6,
  },
  modalEquipment: {
    gap: 8,
  },
  modalEquipmentItem: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  modalButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.2)',
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
