import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MockContractor,
  MockProject,
  mockContractors,
  mockProjects,
  getMatchedContractors,
  searchContractors,
} from '../services/mockData';

interface ContractorSearchScreenProps {
  projectId?: string;
  onBack: () => void;
  onViewContractor: (contractor: MockContractor) => void;
}

const ContractorSearchScreen: React.FC<ContractorSearchScreenProps> = ({
  projectId,
  onBack,
  onViewContractor,
}) => {
  const [searchMode, setSearchMode] = useState<'ai-match' | 'manual-search'>(
    projectId ? 'ai-match' : 'manual-search'
  );
  
  // AI Match state
  const [matchedContractors, setMatchedContractors] = useState<Array<MockContractor & { matchScore: number }>>([]);
  const [project, setProject] = useState<MockProject | null>(null);

  // Manual Search state
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [selectedAvailability, setSelectedAvailability] = useState<string>('');
  const [maxHourlyRate, setMaxHourlyRate] = useState<number>(0);
  const [searchResults, setSearchResults] = useState<MockContractor[]>(mockContractors);

  useEffect(() => {
    if (projectId && searchMode === 'ai-match') {
      // Load project and get AI matches
      const foundProject = mockProjects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        const matches = getMatchedContractors(foundProject);
        setMatchedContractors(matches);
      }
    }
  }, [projectId, searchMode]);

  const handleManualSearch = () => {
    const results = searchContractors({
      specialty: searchSpecialty,
      location: searchLocation,
      minRating: minRating || undefined,
      availability: selectedAvailability || undefined,
      maxHourlyRate: maxHourlyRate || undefined,
    });
    setSearchResults(results);
  };

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

  const renderContractorCard = (contractor: MockContractor, matchScore?: number) => (
    <TouchableOpacity
      key={contractor.id}
      style={styles.contractorCard}
      onPress={() => onViewContractor(contractor)}
    >
      {/* Match Score Badge (if AI matching) */}
      {matchScore !== undefined && (
        <View style={styles.matchScoreContainer}>
          {renderMatchScore(matchScore)}
        </View>
      )}

      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.contractorName}>{contractor.name}</Text>
          <Text style={styles.companyName}>{contractor.companyName}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <Text style={styles.hourlyRate}>${contractor.hourlyRate}/hr</Text>
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
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Projects:</Text>
          <Text style={styles.statValue}>{contractor.projectsCompleted}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Response:</Text>
          <Text style={styles.statValue}>{contractor.responseTime}</Text>
        </View>
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

        <View style={styles.badges}>
          {contractor.insurance.liability && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓ Insured</Text>
            </View>
          )}
          {contractor.insurance.bonded && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓ Bonded</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.viewProfileButton}>
        <Text style={styles.viewProfileText}>View Full Profile →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAIMatchView = () => (
    <View style={styles.content}>
      {project && (
        <View style={styles.projectInfoCard}>
          <Text style={styles.projectInfoTitle}>Finding Matches For:</Text>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectDetails}>
            Budget: ${project.budget.toLocaleString()} • {project.services.join(', ')}
          </Text>
        </View>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          🎯 AI-Matched Contractors ({matchedContractors.length})
        </Text>
        <Text style={styles.resultsSubtitle}>
          Ranked by compatibility with your project
        </Text>
      </View>

      {matchedContractors.length > 0 ? (
        matchedContractors.map((contractor, index) => (
          <View key={contractor.id}>
            {index === 0 && (
              <View style={styles.topMatchBanner}>
                <Text style={styles.topMatchText}>⭐ Best Match</Text>
              </View>
            )}
            {renderContractorCard(contractor, contractor.matchScore)}
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No matching contractors found</Text>
          <Text style={styles.emptyStateSubtext}>Try adjusting your project requirements</Text>
        </View>
      )}
    </View>
  );

  const renderManualSearchView = () => (
    <View style={styles.content}>
      {/* Search Filters */}
      <View style={styles.searchFilters}>
        <Text style={styles.filterTitle}>Search Contractors</Text>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Specialty:</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="e.g., Kitchen Remodeling, Roofing..."
            placeholderTextColor="#999"
            value={searchSpecialty}
            onChangeText={setSearchSpecialty}
          />
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Location:</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="City or State"
            placeholderTextColor="#999"
            value={searchLocation}
            onChangeText={setSearchLocation}
          />
        </View>

        <View style={styles.filterRow}>
          <View style={styles.filterGroupSmall}>
            <Text style={styles.filterLabel}>Min Rating:</Text>
            <View style={styles.ratingPicker}>
              {[0, 3, 4, 4.5, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingOption,
                    minRating === rating && styles.ratingOptionActive,
                  ]}
                  onPress={() => setMinRating(rating)}
                >
                  <Text
                    style={[
                      styles.ratingOptionText,
                      minRating === rating && styles.ratingOptionTextActive,
                    ]}
                  >
                    {rating === 0 ? 'Any' : `${rating}★`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Availability:</Text>
          <View style={styles.availabilityOptions}>
            {['', 'available', 'busy'].map((avail) => (
              <TouchableOpacity
                key={avail}
                style={[
                  styles.availabilityOption,
                  selectedAvailability === avail && styles.availabilityOptionActive,
                ]}
                onPress={() => setSelectedAvailability(avail)}
              >
                <Text
                  style={[
                    styles.availabilityOptionText,
                    selectedAvailability === avail && styles.availabilityOptionTextActive,
                  ]}
                >
                  {avail === '' && 'Any'}
                  {avail === 'available' && 'Available Now'}
                  {avail === 'busy' && 'Busy'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleManualSearch}>
          <Text style={styles.searchButtonText}>🔍 Search Contractors</Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          Search Results ({searchResults.length})
        </Text>
      </View>

      {searchResults.length > 0 ? (
        searchResults.map((contractor) => renderContractorCard(contractor))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No contractors found</Text>
          <Text style={styles.emptyStateSubtext}>Try different search criteria</Text>
        </View>
      )}
    </View>
  );

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80' }}
      style={styles.backgroundImage}
      blurRadius={10}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Find Contractors</Text>
          </View>

          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, searchMode === 'ai-match' && styles.modeButtonActive]}
              onPress={() => setSearchMode('ai-match')}
              disabled={!projectId}
            >
              <Text style={[styles.modeButtonText, searchMode === 'ai-match' && styles.modeButtonTextActive]}>
                🎯 AI Match{!projectId && ' (Select Project)'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, searchMode === 'manual-search' && styles.modeButtonActive]}
              onPress={() => setSearchMode('manual-search')}
            >
              <Text style={[styles.modeButtonText, searchMode === 'manual-search' && styles.modeButtonTextActive]}>
                🔍 Manual Search
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {searchMode === 'ai-match' ? renderAIMatchView() : renderManualSearchView()}
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
});

export default ContractorSearchScreen;
