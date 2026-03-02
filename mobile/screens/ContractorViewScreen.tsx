import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MockContractor, getReviewsByContractorId } from '../services/mockData';

const { width } = Dimensions.get('window');

interface ContractorViewScreenProps {
  contractor: MockContractor;
  onBack: () => void;
  onSendMessage: (contractorId: string) => void;
  onRequestEstimate: (contractorId: string) => void;
}

const ContractorViewScreen: React.FC<ContractorViewScreenProps> = ({
  contractor,
  onBack,
  onSendMessage,
  onRequestEstimate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'reviews'>('overview');
  const reviews = getReviewsByContractorId(contractor.id);

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

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>{contractor.bio}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{contractor.yearsExperience}</Text>
            <Text style={styles.statLabel}>Years Experience</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{contractor.projectsCompleted}</Text>
            <Text style={styles.statLabel}>Projects Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{contractor.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>${contractor.hourlyRate}</Text>
            <Text style={styles.statLabel}>Hourly Rate</Text>
          </View>
        </View>
      </View>

      {/* Specialties */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specialties</Text>
        <View style={styles.tagsContainer}>
          {contractor.specialties.map((specialty, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Licenses & Insurance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Licenses & Insurance</Text>
        {contractor.licenses.map((license, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.listItemText}>{license}</Text>
          </View>
        ))}
        <View style={styles.insuranceGrid}>
          <View style={[styles.insuranceBadge, contractor.insurance.liability && styles.insuranceBadgeActive]}>
            <Text style={[styles.insuranceText, contractor.insurance.liability && styles.insuranceTextActive]}>
              {contractor.insurance.liability ? '✓' : '✗'} Liability Insurance
            </Text>
          </View>
          <View style={[styles.insuranceBadge, contractor.insurance.workersComp && styles.insuranceBadgeActive]}>
            <Text style={[styles.insuranceText, contractor.insurance.workersComp && styles.insuranceTextActive]}>
              {contractor.insurance.workersComp ? '✓' : '✗'} Workers Comp
            </Text>
          </View>
          <View style={[styles.insuranceBadge, contractor.insurance.bonded && styles.insuranceBadgeActive]}>
            <Text style={[styles.insuranceText, contractor.insurance.bonded && styles.insuranceTextActive]}>
              {contractor.insurance.bonded ? '✓' : '✗'} Bonded
            </Text>
          </View>
        </View>
      </View>

      {/* Certifications */}
      {contractor.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {contractor.certifications.map((cert, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.checkmark}>★</Text>
              <Text style={styles.listItemText}>{cert}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Service Area */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Area</Text>
        <Text style={styles.serviceAreaText}>
          {contractor.serviceArea.city}, {contractor.serviceArea.state} (+ {contractor.serviceArea.radius} mile radius)
        </Text>
      </View>

      {/* Availability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={[styles.availabilityBadge, styles[`availability_${contractor.availability}`]]}>
          <Text style={styles.availabilityText}>
            {contractor.availability === 'available' && '✓ Available Now'}
            {contractor.availability === 'busy' && '⚠ Busy - Limited Availability'}
            {contractor.availability === 'booked' && '✗ Fully Booked'}
          </Text>
        </View>
        <Text style={styles.responseTimeText}>
          Typical response time: {contractor.responseTime}
        </Text>
      </View>
    </View>
  );

  const renderPortfolio = () => (
    <View style={styles.tabContent}>
      {contractor.portfolio.length > 0 ? (
        contractor.portfolio.map((project, index) => (
          <View key={project.id} style={styles.portfolioItem}>
            <Text style={styles.portfolioTitle}>{project.title}</Text>
            <Text style={styles.portfolioDescription}>{project.description}</Text>
            
            {project.images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioImagesScroll}>
                {project.images.map((image, imgIndex) => (
                  <Image
                    key={imgIndex}
                    source={{ uri: image }}
                    style={styles.portfolioImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}

            <View style={styles.portfolioDetails}>
              <View style={styles.portfolioDetailItem}>
                <Text style={styles.portfolioDetailLabel}>Cost:</Text>
                <Text style={styles.portfolioDetailValue}>${project.cost.toLocaleString()}</Text>
              </View>
              <View style={styles.portfolioDetailItem}>
                <Text style={styles.portfolioDetailLabel}>Duration:</Text>
                <Text style={styles.portfolioDetailValue}>{project.duration}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No portfolio items available yet</Text>
        </View>
      )}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.tabContent}>
      {reviews.length > 0 ? (
        <>
          {/* Overall Rating Summary */}
          <View style={styles.ratingsSummary}>
            <View style={styles.overallRating}>
              <Text style={styles.overallRatingNumber}>{contractor.rating.toFixed(1)}</Text>
              {renderStars(contractor.rating)}
              <Text style={styles.reviewCount}>{contractor.reviewCount} reviews</Text>
            </View>
            
            {/* Category Ratings */}
            <View style={styles.categoryRatings}>
              {reviews.length > 0 && reviews[0].categories && (
                <>
                  {Object.entries(reviews[0].categories).map(([category, rating]) => (
                    <View key={category} style={styles.categoryRatingRow}>
                      <Text style={styles.categoryLabel}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}:
                      </Text>
                      <View style={styles.categoryStars}>
                        {renderStars(rating)}
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          </View>

          {/* Individual Reviews */}
          {reviews.map((review, index) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                {renderStars(review.rating)}
                <Text style={styles.reviewDate}>
                  {new Date(review.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              {review.response && (
                <View style={styles.contractorResponse}>
                  <Text style={styles.responseLabel}>Contractor Response:</Text>
                  <Text style={styles.responseText}>{review.response}</Text>
                </View>
              )}
            </View>
          ))}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No reviews yet</Text>
        </View>
      )}
    </View>
  );

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80' }}
      style={styles.backgroundImage}
      blurRadius={10}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profileHeader}>
              <Image source={{ uri: contractor.avatar }} style={styles.avatar} />
              <View style={styles.headerInfo}>
                <Text style={styles.contractorName}>{contractor.name}</Text>
                <Text style={styles.companyName}>{contractor.companyName}</Text>
                <View style={styles.ratingRow}>
                  {renderStars(contractor.rating)}
                  <Text style={styles.ratingText}>
                    {contractor.rating.toFixed(1)} ({contractor.reviewCount} reviews)
                  </Text>
                </View>
              </View>
            </View>

            {/* Contact Buttons */}
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => onSendMessage(contractor.id)}
              >
                <Text style={styles.messageButtonText}>💬 Send Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.estimateButton}
                onPress={() => onRequestEstimate(contractor.id)}
              >
                <Text style={styles.estimateButtonText}>📋 Request Estimate</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'portfolio' && styles.activeTab]}
              onPress={() => setActiveTab('portfolio')}
            >
              <Text style={[styles.tabText, activeTab === 'portfolio' && styles.activeTabText]}>
                Portfolio ({contractor.portfolio.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                Reviews ({reviews.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'portfolio' && renderPortfolio()}
          {activeTab === 'reviews' && renderReviews()}
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
  headerTop: {
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  headerInfo: {
    flex: 1,
  },
  contractorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  companyName: {
    fontSize: 16,
    color: '#D4AF37',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  star: {
    color: '#D4AF37',
    fontSize: 18,
    marginRight: 2,
  },
  ratingText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  messageButton: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  estimateButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  estimateButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 5,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#D4AF37',
  },
  tabText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#000000',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 15,
  },
  bioText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  tagText: {
    color: '#D4AF37',
    fontSize: 13,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: 18,
    marginRight: 10,
    fontWeight: 'bold',
  },
  listItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  insuranceGrid: {
    marginTop: 10,
    gap: 8,
  },
  insuranceBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666666',
  },
  insuranceBadgeActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
  },
  insuranceText: {
    color: '#999999',
    fontSize: 14,
  },
  insuranceTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  serviceAreaText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  availabilityBadge: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  availability_available: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  availability_busy: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  availability_booked: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  availabilityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  responseTimeText: {
    color: '#CCCCCC',
    fontSize: 13,
  },
  portfolioItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  portfolioDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  portfolioImagesScroll: {
    marginBottom: 15,
  },
  portfolioImage: {
    width: width - 100,
    height: 200,
    borderRadius: 8,
    marginRight: 10,
  },
  portfolioDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  portfolioDetailItem: {
    flex: 1,
  },
  portfolioDetailLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 3,
  },
  portfolioDetailValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingsSummary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: 20,
  },
  overallRatingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 5,
  },
  reviewCount: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 5,
  },
  categoryRatings: {
    gap: 8,
  },
  categoryRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  categoryStars: {
    flexDirection: 'row',
  },
  reviewItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewDate: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  reviewComment: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  contractorResponse: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  responseLabel: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  responseText: {
    color: '#CCCCCC',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#CCCCCC',
    fontSize: 16,
  },
});

export default ContractorViewScreen;
