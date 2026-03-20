import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Screen } from '../types/navigation';

interface CareerProgram {
  id: string;
  title: string;
  provider: string;
  type: 'apprenticeship' | 'certification' | 'training' | 'college';
  field: string;
  duration: string;
  cost: string;
  location: string;
  isOnline: boolean;
  jobPlacement: number;
  prerequisites: string[];
  benefits: string[];
}

interface CareerOpportunitiesDashboardProps {
  onBack: () => void;
  onNavigate: (screen: Screen, params?: unknown) => void;
}

export default function CareerOpportunitiesDashboard({ onBack, onNavigate }: CareerOpportunitiesDashboardProps) {
  const [programs, setPrograms] = useState<CareerProgram[]>([
    {
      id: '1',
      title: 'Electrician Apprenticeship Program',
      provider: 'IBEW Local 11',
      type: 'apprenticeship',
      field: 'Electrical',
      duration: '5 years',
      cost: 'Earn while you learn',
      location: 'Los Angeles, CA',
      isOnline: false,
      jobPlacement: 98,
      prerequisites: ['18+ years old', 'High school diploma', 'Pass aptitude test'],
      benefits: ['Union membership', 'Full benefits', 'Pension', 'Starting $22/hr'],
    },
    {
      id: '2',
      title: 'Plumbing Certification Course',
      provider: 'Trade Skills Academy',
      type: 'certification',
      field: 'Plumbing',
      duration: '6 months',
      cost: '$3,500',
      location: 'Multiple Locations',
      isOnline: true,
      jobPlacement: 85,
      prerequisites: ['None', 'Beginner friendly'],
      benefits: ['Hands-on training', 'Job placement assistance', 'Weekend classes'],
    },
    {
      id: '3',
      title: 'Construction Management Degree',
      provider: 'Cal State University',
      type: 'college',
      field: 'Project Management',
      duration: '2 years',
      cost: '$15,000/year',
      location: 'Long Beach, CA',
      isOnline: true,
      jobPlacement: 92,
      prerequisites: ['Associate degree or equivalent', 'Work experience preferred'],
      benefits: ['Bachelor\'s degree', 'Industry connections', 'Evening classes'],
    },
    {
      id: '4',
      title: 'OSHA Safety Certification',
      provider: 'Construction Safety Institute',
      type: 'certification',
      field: 'Safety',
      duration: '30 hours',
      cost: '$495',
      location: 'Online',
      isOnline: true,
      jobPlacement: 0,
      prerequisites: ['None'],
      benefits: ['OSHA 30 Card', 'Self-paced', 'Immediate certification'],
    },
    {
      id: '5',
      title: 'Carpentry Training Program',
      provider: 'Carpenters Union Local 213',
      type: 'apprenticeship',
      field: 'Carpentry',
      duration: '4 years',
      cost: 'Paid apprenticeship',
      location: 'Los Angeles, CA',
      isOnline: false,
      jobPlacement: 95,
      prerequisites: ['18+ years old', 'Physical fitness', 'Drug test'],
      benefits: ['Union wages', 'Health insurance', 'Retirement plan', '$18-$45/hr progression'],
    },
    {
      id: '6',
      title: 'Heavy Equipment Operator Training',
      provider: 'Equipment Operators Training School',
      type: 'training',
      field: 'Equipment Operation',
      duration: '3 months',
      cost: '$7,200',
      location: 'Riverside, CA',
      isOnline: false,
      jobPlacement: 88,
      prerequisites: ['Valid driver\'s license', '18+ years old'],
      benefits: ['CDL training included', 'Job placement', 'Hands-on experience'],
    },
  ]);

  const [selectedProgram, setSelectedProgram] = useState<CareerProgram | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'apprenticeship': return '#4CAF50';
      case 'certification': return '#2196F3';
      case 'training': return '#FF9800';
      case 'college': return '#9C27B0';
      default: return '#999999';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const programTypes = ['all', 'apprenticeship', 'certification', 'training', 'college'];

  const filteredPrograms = filterType === 'all' 
    ? programs 
    : programs.filter(p => p.type === filterType);

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80' }}
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
            <Text style={styles.headerTitle}>Career Development</Text>
            <Text style={styles.headerSubtitle}>
              Training programs, certifications, and career advancement opportunities
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{programs.length}</Text>
              <Text style={styles.statLabel}>Programs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{programs.filter(p => p.isOnline).length}</Text>
              <Text style={styles.statLabel}>Online Options</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {programs.filter(p => p.type === 'apprenticeship').length}
              </Text>
              <Text style={styles.statLabel}>Apprenticeships</Text>
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filter by Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {programTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    filterType === type && styles.filterChipActive
                  ]}
                  onPress={() => setFilterType(type)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterType === type && styles.filterChipTextActive
                  ]}>
                    {type === 'all' ? 'All Programs' : getTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Programs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Training & Education</Text>

            {filteredPrograms.map((program) => (
              <TouchableOpacity
                key={program.id}
                style={styles.programCard}
                onPress={() => setSelectedProgram(program)}
              >
                <View style={styles.programHeader}>
                  <View style={styles.programInfo}>
                    <Text style={styles.programTitle}>{program.title}</Text>
                    <Text style={styles.programProvider}>By {program.provider}</Text>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: getTypeColor(program.type) }]}>
                    <Text style={styles.typeText}>{getTypeLabel(program.type)}</Text>
                  </View>
                </View>

                <View style={styles.programDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📚</Text>
                    <Text style={styles.detailText}>Field: {program.field}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>⏱️</Text>
                    <Text style={styles.detailText}>Duration: {program.duration}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>💰</Text>
                    <Text style={styles.detailText}>Cost: {program.cost}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>
                      {program.location} {program.isOnline && '(Online Available)'}
                    </Text>
                  </View>
                  {program.jobPlacement > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>✅</Text>
                      <Text style={[styles.detailText, { color: '#4CAF50', fontWeight: '600' }]}>
                        {program.jobPlacement}% job placement rate
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.benefitsContainer}>
                  <Text style={styles.benefitsLabel}>Program Benefits:</Text>
                  <View style={styles.benefitsList}>
                    {program.benefits.slice(0, 3).map((benefit, index) => (
                      <Text key={index} style={styles.benefitItem}>• {benefit}</Text>
                    ))}
                  </View>
                </View>

                <View style={styles.programFooter}>
                  <Text style={styles.learnMoreText}>Learn More →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Career Paths */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Career Paths</Text>

            <TouchableOpacity 
              style={styles.pathCard}
              onPress={() => Alert.alert('Electrical Career Path', 'Explore career opportunities in electrical work')}
            >
              <Text style={styles.pathIcon}>⚡</Text>
              <View style={styles.pathContent}>
                <Text style={styles.pathTitle}>Electrical</Text>
                <Text style={styles.pathDescription}>
                  Apprentice → Journeyman → Master Electrician
                </Text>
                <Text style={styles.pathSalary}>$55k - $95k+ annually</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.pathCard}
              onPress={() => Alert.alert('Plumbing Career Path', 'Explore career opportunities in plumbing')}
            >
              <Text style={styles.pathIcon}>🔧</Text>
              <View style={styles.pathContent}>
                <Text style={styles.pathTitle}>Plumbing</Text>
                <Text style={styles.pathDescription}>
                  Helper → Apprentice → Licensed Plumber
                </Text>
                <Text style={styles.pathSalary}>$50k - $85k+ annually</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.pathCard}
              onPress={() => Alert.alert('Project Management', 'Advance to leadership roles')}
            >
              <Text style={styles.pathIcon}>👷</Text>
              <View style={styles.pathContent}>
                <Text style={styles.pathTitle}>Project Management</Text>
                <Text style={styles.pathDescription}>
                  Foreman → Superintendent → Project Manager
                </Text>
                <Text style={styles.pathSalary}>$70k - $120k+ annually</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.pathCard}
              onPress={() => Alert.alert('Specialty Trades', 'Explore specialized construction trades')}
            >
              <Text style={styles.pathIcon}>🏗️</Text>
              <View style={styles.pathContent}>
                <Text style={styles.pathTitle}>Specialty Trades</Text>
                <Text style={styles.pathDescription}>
                  HVAC, Welding, Heavy Equipment, Carpentry
                </Text>
                <Text style={styles.pathSalary}>$45k - $90k+ annually</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Resources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Career Resources</Text>

            <View style={styles.resourceCard}>
              <Text style={styles.resourceIcon}>📝</Text>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>Resume Building</Text>
                <Text style={styles.resourceDescription}>
                  Create a professional construction resume and portfolio
                </Text>
              </View>
            </View>

            <View style={styles.resourceCard}>
              <Text style={styles.resourceIcon}>🎓</Text>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>Financial Aid</Text>
                <Text style={styles.resourceDescription}>
                  Learn about grants, loans, and scholarship opportunities
                </Text>
              </View>
            </View>

            <View style={styles.resourceCard}>
              <Text style={styles.resourceIcon}>👨‍🏫</Text>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>Mentorship Program</Text>
                <Text style={styles.resourceDescription}>
                  Connect with experienced professionals in your field
                </Text>
              </View>
            </View>

            <View style={styles.resourceCard}>
              <Text style={styles.resourceIcon}>📱</Text>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>Career Counseling</Text>
                <Text style={styles.resourceDescription}>
                  Get guidance on choosing the right career path
                </Text>
              </View>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              💡 Invest in your future! Many apprenticeships and training programs offer earn-while-you-learn opportunities with excellent job placement rates.
            </Text>
          </View>
        </ScrollView>

        {/* Program Detail Modal */}
        {selectedProgram && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSelectedProgram(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={[styles.modalTypeBadge, { backgroundColor: getTypeColor(selectedProgram.type) }]}>
                    <Text style={styles.modalTypeText}>{getTypeLabel(selectedProgram.type)}</Text>
                  </View>

                  <Text style={styles.modalTitle}>{selectedProgram.title}</Text>
                  <Text style={styles.modalProvider}>Offered by {selectedProgram.provider}</Text>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Program Details</Text>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Field:</Text>
                      <Text style={styles.modalDetailValue}>{selectedProgram.field}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Duration:</Text>
                      <Text style={styles.modalDetailValue}>{selectedProgram.duration}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Cost:</Text>
                      <Text style={styles.modalDetailValue}>{selectedProgram.cost}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Location:</Text>
                      <Text style={styles.modalDetailValue}>
                        {selectedProgram.location}
                        {selectedProgram.isOnline && ' + Online'}
                      </Text>
                    </View>
                    {selectedProgram.jobPlacement > 0 && (
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalDetailLabel}>Job Placement:</Text>
                        <Text style={[styles.modalDetailValue, { color: '#4CAF50' }]}>
                          {selectedProgram.jobPlacement}%
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Prerequisites</Text>
                    {selectedProgram.prerequisites.map((prereq, index) => (
                      <Text key={index} style={styles.modalListItem}>• {prereq}</Text>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Program Benefits</Text>
                    {selectedProgram.benefits.map((benefit, index) => (
                      <Text key={index} style={styles.modalBenefitItem}>✓ {benefit}</Text>
                    ))}
                  </View>

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedProgram(null);
                      Alert.alert('Apply', `Apply to ${selectedProgram.title}`);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Apply Now</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedProgram(null);
                      Alert.alert('Info Request', 'Request more information');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Request Information</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButtonSecondary}
                    onPress={() => setSelectedProgram(null)}
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
  programCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  programProvider: {
    fontSize: 13,
    color: '#CCCCCC',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  programDetails: {
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
  benefitsContainer: {
    marginBottom: 12,
  },
  benefitsLabel: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 8,
  },
  benefitsList: {
    paddingLeft: 5,
  },
  benefitItem: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 4,
  },
  programFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    alignItems: 'center',
  },
  learnMoreText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
  },
  pathCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pathIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  pathContent: {
    flex: 1,
  },
  pathTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  pathDescription: {
    fontSize: 13,
    color: '#CCCCCC',
    marginBottom: 6,
  },
  pathSalary: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  resourceCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resourceIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  resourceDescription: {
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
  modalTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  modalTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalProvider: {
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
  modalListItem: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 6,
  },
  modalBenefitItem: {
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
