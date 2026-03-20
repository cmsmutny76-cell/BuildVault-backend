import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ImageBackground, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface Contractor {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  yearsExperience: number;
  availability: string;
  hourlyRate?: number;
  budgetRange?: { min: number; max: number };
  serviceRadius?: number;
  location?: { city: string; state: string; zipCode: string };
  certifications?: string[];
  completedProjects?: number;
  responseTime?: number;
}

interface MatchedContractor extends Contractor {
  matchScore: number;
  matchReasons?: string[];
}

interface ContractorSearchScreenProps {
  projectId?: string;
  onBack: () => void;
  onViewContractor: (contractor: Contractor) => void;
}

const ContractorSearchScreen: React.FC<ContractorSearchScreenProps> = ({
  projectId,
  onBack,
  onViewContractor,
}) => {
  const [matchedContractors, setMatchedContractors] = useState<MatchedContractor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchMatchedContractors();
    }
  }, [projectId]);

  const fetchMatchedContractors = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      // First, fetch the project details
      const projectResponse = await fetch(`http://localhost:3000/api/projects`);
      const projectData = await projectResponse.json();

      if (!projectData.success || !projectData.projects) {
        throw new Error('Failed to fetch project details');
      }

      const project = projectData.projects.find((p: any) => p.id === projectId);

      if (!project) {
        throw new Error('Project not found');
      }

      // Call AI matching API
      const matchResponse = await fetch('http://localhost:3000/api/ai/match-contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectType: project.projectType || 'residential',
          budget: 50000, // TODO: Get from project or use default
          location: {
            zipCode: project.location?.zipCode || '78701',
            city: project.location?.city || 'Austin',
            state: project.location?.state || 'TX',
          },
          services: [project.projectType || 'general'],
          timeline: '3-6 months',
          urgency: 'medium',
        }),
      });

      const matchData = await matchResponse.json();

      if (matchData.success && matchData.contractors) {
        setMatchedContractors(matchData.contractors);
      } else {
        setMatchedContractors([]);
      }
    } catch (err) {
      console.error('Failed to fetch matched contractors:', err);
      setError('Failed to load contractors. Please try again.');
      setMatchedContractors([]);
    } finally {
      setLoading(false);
    }
  };

  if (!projectId) {
    return (
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80' }}
        style={styles.backgroundImage}
        blurRadius={2}
      >
        <LinearGradient colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']} style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Find Contractors</Text>
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateTitle}>No Project Selected</Text>
            <Text style={styles.emptyStateText}>
              Please select a project first to find matched contractors
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    );
  }

  if (loading) {
    return (
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80' }}
        style={styles.backgroundImage}
        blurRadius={2}
      >
        <LinearGradient colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']} style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Find Contractors</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>Finding the best matches for your project...</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={styles.star}>
            {star <= rating ? '★' : '☆'}
          </Text>
        ))}
      </View>
    );
  };

  const renderMatchScore = (score: number) => {
    let color = '#4CAF50'; // Green for high match
    if (score < 70) color = '#FF9800'; // Orange for medium
    if (score < 50) color = '#F44336'; // Red for low

    return (
      <View style={[styles.matchScoreBadge, { borderColor: color }]}>
        <Text style={[styles.matchScoreText, { color }]}>{score}% Match</Text>
      </View>
    );
  };

  const renderContractorCard = (contractor: MatchedContractor) => (
    <TouchableOpacity
      key={contractor.id}
      style={styles.contractorCard}
      onPress={() => onViewContractor(contractor)}
    >
      {/* Match Score Badge */}
      <View style={styles.matchScoreContainer}>
        {renderMatchScore(contractor.matchScore)}
      </View>

      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.contractorName}>{contractor.name}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {contractor.budgetRange && (
            <Text style={styles.hourlyRate}>
              ${contractor.budgetRange.min / 1000}k - ${contractor.budgetRange.max / 1000}k
            </Text>
          )}
        </View>
      </View>

      <View style={styles.cardRating}>
        {renderStars(contractor.rating)}
        <Text style={styles.ratingText}>
          {contractor.rating.toFixed(1)} ({contractor.reviewCount} reviews)
        </Text>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Experience:</Text>
          <Text style={styles.statValue}>{contractor.yearsExperience} years</Text>
        </View>
        {contractor.completedProjects && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Projects:</Text>
            <Text style={styles.statValue}>{contractor.completedProjects}</Text>
          </View>
        )}
        {contractor.responseTime && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Response:</Text>
            <Text style={styles.statValue}>{contractor.responseTime}h</Text>
          </View>
        )}
      </View>

      <View style={styles.cardSpecialties}>
        {contractor.specialties.slice(0, 3).map((specialty, index) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
        {contractor.specialties.length > 3 && (
          <Text style={styles.moreSpecialties}>+{contractor.specialties.length - 3} more</Text>
        )}
      </View>

      {contractor.matchReasons && contractor.matchReasons.length > 0 && (
        <View style={styles.matchReasons}>
          <Text style={styles.matchReasonsTitle}>Why this match:</Text>
          {contractor.matchReasons.slice(0, 2).map((reason, index) => (
            <Text key={index} style={styles.matchReason}>• {reason}</Text>
          ))}
        </View>
      )}

      <View style={styles.cardFooter}>
        <View style={[
          styles.availabilityBadge,
          contractor.availability === 'available' && styles.availabilityAvailable,
          contractor.availability === 'busy' && styles.availabilityBusy,
          contractor.availability === 'booked' && styles.availabilityBooked,
        ]}>
          <Text style={styles.availabilityText}>
            {contractor.availability === 'available' && '✓ Available'}
            {contractor.availability === 'busy' && '⚠ Busy'}
            {contractor.availability === 'booked' && '✗ Booked'}
          </Text>
        </View>

        {contractor.certifications && contractor.certifications.length > 0 && (
          <View style={styles.badges}>
            {contractor.certifications.includes('Licensed') && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ Licensed</Text>
              </View>
            )}
            {contractor.certifications.includes('Insured') && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ Insured</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.viewProfileButton}>
        <Text style={styles.viewProfileText}>View Full Profile →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80' }}
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <LinearGradient colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Find Contractors</Text>
            <Text style={styles.headerSubtitle}>AI-Matched for Your Project</Text>
          </View>

          {/* Results */}
          <View style={styles.content}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                🎯 Matched Contractors ({matchedContractors.length})
              </Text>
              <Text style={styles.resultsSubtitle}>
                Ranked by compatibility with your project
              </Text>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {matchedContractors.length > 0 ? (
              matchedContractors.map((contractor, index) => (
                <View key={contractor.id}>
                  {index === 0 && (
                    <View style={styles.topMatchBanner}>
                      <Text style={styles.topMatchText}>⭐ Best Match</Text>
                    </View>
                  )}
                  {renderContractorCard(contractor)}
                </View>
              ))
            ) : !loading && (
              <View style={styles.emptyMatchState}>
                <Text style={styles.emptyStateIcon}>🔍</Text>
                <Text style={styles.emptyStateTitle}>No Matches Found</Text>
                <Text style={styles.emptyStateText}>
                  We couldn't find contractors matching your project criteria
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

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
    marginBottom: 15,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modeToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 5,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#D4AF37',
  },
  modeButtonText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#000000',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  projectInfoCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  projectInfoTitle: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  projectTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  projectDetails: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  resultsHeader: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  topMatchBanner: {
    backgroundColor: '#D4AF37',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: -12,
  },
  topMatchText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contractorCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  matchScoreContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  matchScoreBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
  },
  matchScoreText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {},
  contractorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  companyName: {
    fontSize: 14,
    color: '#D4AF37',
  },
  hourlyRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  star: {
    color: '#D4AF37',
    fontSize: 16,
    marginRight: 1,
  },
  ratingText: {
    color: '#CCCCCC',
    fontSize: 13,
  },
  cardStats: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: '#999999',
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  cardSpecialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  specialtyTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  specialtyText: {
    color: '#D4AF37',
    fontSize: 11,
  },
  moreSpecialties: {
    color: '#999999',
    fontSize: 11,
    alignSelf: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  availabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  availabilityAvailable: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
  },
  availabilityBusy: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderColor: '#FF9800',
  },
  availabilityBooked: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderColor: '#F44336',
  },
  availabilityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  badgeText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: '600',
  },
  viewProfileButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewProfileText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  searchFilters: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 20,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  filterRow: {
    marginBottom: 20,
  },
  filterGroupSmall: {},
  ratingPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingOption: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ratingOptionActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  ratingOptionText: {
    color: '#CCCCCC',
    fontSize: 13,
    fontWeight: '600',
  },
  ratingOptionTextActive: {
    color: '#000000',
  },
  availabilityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  availabilityOption: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  availabilityOptionActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  availabilityOptionText: {
    color: '#CCCCCC',
    fontSize: 13,
    fontWeight: '600',
  },
  availabilityOptionTextActive: {
    color: '#000000',
  },
  searchButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyMatchState: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
  },
  matchReasons: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  matchReasonsTitle: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  matchReason: {
    color: '#CCCCCC',
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 4,
  },
});

export default ContractorSearchScreen;
