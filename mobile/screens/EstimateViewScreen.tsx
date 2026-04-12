import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MockEstimate, MockContractor, getContractorById, mockEstimates } from '../services/mockData';

interface EstimateViewScreenProps {
  estimate: MockEstimate;
  onBack: () => void;
  onAccept: (estimateId: string) => void;
  onReject: (estimateId: string) => void;
  onContactContractor: (contractorId: string) => void;
}

const EstimateViewScreen: React.FC<EstimateViewScreenProps> = ({
  estimate,
  onBack,
  onAccept,
  onReject,
  onContactContractor,
}) => {
  const contractor = getContractorById(estimate.contractorId);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['labor', 'materials']));

  if (!contractor) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Contractor not found</Text>
      </View>
    );
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryTotal = (category: string) => {
    return estimate.lineItems
      .filter(item => item.category === category)
      .reduce((sum, item) => sum + item.total, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#999999';
      case 'sent': return '#2196F3';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#999999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '📝 Draft';
      case 'sent': return '📤 Sent - Awaiting Response';
      case 'accepted': return '✓ Accepted';
      case 'rejected': return '✗ Rejected';
      default: return status;
    }
  };

  const handleAccept = () => {
    Alert.alert(
      'Accept Estimate?',
      `Are you sure you want to accept this $${estimate.total.toLocaleString()} estimate from ${contractor.companyName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: () => onAccept(estimate.id),
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Estimate?',
      'Are you sure you want to reject this estimate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => onReject(estimate.id),
        },
      ]
    );
  };

  const categoryIcons: { [key: string]: string } = {
    labor: '👷',
    materials: '🧱',
    equipment: '🔧',
    permits: '📋',
    other: '📦',
  };

  const categories = ['labor', 'materials', 'equipment', 'permits', 'other'];
  const categoriesWithItems = categories.filter(cat => 
    estimate.lineItems.some(item => item.category === cat)
  );

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80' }}
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
            <Text style={styles.headerTitle}>Estimate Details</Text>
          </View>

          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(estimate.status)}20`, borderColor: getStatusColor(estimate.status) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(estimate.status) }]}>
                {getStatusText(estimate.status)}
              </Text>
            </View>
          </View>

          {/* Contractor Info */}
          <View style={styles.contractorCard}>
            <Text style={styles.sectionTitle}>From Contractor:</Text>
            <View style={styles.contractorInfo}>
              <View style={styles.contractorDetails}>
                <Text style={styles.contractorName}>{contractor.name}</Text>
                <Text style={styles.companyName}>{contractor.companyName}</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.starRating}>★ {contractor.rating.toFixed(1)}</Text>
                  <Text style={styles.reviewCount}>({contractor.reviewCount} reviews)</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => onContactContractor(contractor.id)}
              >
                <Text style={styles.contactButtonText}>💬 Contact</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Summary */}
          <View style={styles.priceSummaryCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Estimate</Text>
              <Text style={styles.totalAmount}>${estimate.total.toLocaleString()}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Subtotal:</Text>
              <Text style={styles.breakdownValue}>${estimate.subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Tax:</Text>
              <Text style={styles.breakdownValue}>${estimate.tax.toLocaleString()}</Text>
            </View>
            <View style={styles.validityRow}>
              <Text style={styles.validityText}>
                Valid until: {new Date(estimate.validUntil).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Line Items by Category */}
          <View style={styles.lineItemsSection}>
            <Text style={styles.sectionTitle}>Cost Breakdown</Text>
            
            {categoriesWithItems.map((category) => {
              const categoryItems = estimate.lineItems.filter(item => item.category === category);
              const categoryTotal = getCategoryTotal(category);
              const isExpanded = expandedCategories.has(category);

              return (
                <View key={category} style={styles.categorySection}>
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category)}
                  >
                    <View style={styles.categoryLeft}>
                      <Text style={styles.categoryIcon}>{categoryIcons[category]}</Text>
                      <Text style={styles.categoryName}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                      <Text style={styles.categoryCount}>({categoryItems.length})</Text>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={styles.categoryTotal}>${categoryTotal.toLocaleString()}</Text>
                      <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.lineItemsContainer}>
                      {categoryItems.map((item) => (
                        <View key={item.id} style={styles.lineItem}>
                          <View style={styles.lineItemTop}>
                            <Text style={styles.lineItemDescription}>{item.description}</Text>
                            <Text style={styles.lineItemTotal}>${item.total.toLocaleString()}</Text>
                          </View>
                          <View style={styles.lineItemBottom}>
                            <Text style={styles.lineItemDetails}>
                              {item.quantity} × ${item.unitPrice.toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Notes */}
          {estimate.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notes from Contractor</Text>
              <Text style={styles.notesText}>{estimate.notes}</Text>
            </View>
          )}

          {/* Action Buttons */}
          {estimate.status === 'sent' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                <Text style={styles.rejectButtonText}>✗ Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Text style={styles.acceptButtonText}>✓ Accept Estimate</Text>
              </TouchableOpacity>
            </View>
          )}

          {estimate.status === 'accepted' && (
            <View style={styles.acceptedMessage}>
              <Text style={styles.acceptedMessageText}>
                ✓ You accepted this estimate on {new Date().toLocaleDateString()}
              </Text>
              <Text style={styles.acceptedMessageSubtext}>
                The contractor has been notified and will contact you soon to schedule the work.
              </Text>
            </View>
          )}

          {estimate.status === 'rejected' && (
            <View style={styles.rejectedMessage}>
              <Text style={styles.rejectedMessageText}>
                ✗ You rejected this estimate
              </Text>
            </View>
          )}

          {/* Metadata */}
          <View style={styles.metadataSection}>
            <Text style={styles.metadataText}>
              Estimate created: {new Date(estimate.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.metadataText}>
              Estimate ID: {estimate.id}
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

// List view for all estimates of a project
interface EstimateListScreenProps {
  projectId: string;
  onBack: () => void;
  onViewEstimate: (estimate: MockEstimate) => void;
}

export const EstimateListScreen: React.FC<EstimateListScreenProps> = ({
  projectId,
  onBack,
  onViewEstimate,
}) => {
  const projectEstimates = mockEstimates.filter(e => e.projectId === projectId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#999999';
      case 'sent': return '#2196F3';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#999999';
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80' }}
      style={styles.backgroundImage}
      blurRadius={10}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Estimates ({projectEstimates.length})</Text>
          </View>

          {projectEstimates.length > 0 ? (
            projectEstimates.map((estimate) => {
              const contractor = getContractorById(estimate.contractorId);
              if (!contractor) return null;

              return (
                <TouchableOpacity
                  key={estimate.id}
                  style={styles.estimateCard}
                  onPress={() => onViewEstimate(estimate)}
                >
                  <View style={styles.estimateCardHeader}>
                    <View>
                      <Text style={styles.estimateContractor}>{contractor.companyName}</Text>
                      <Text style={styles.estimateDate}>
                        {new Date(estimate.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[styles.estimateStatusBadge, { backgroundColor: `${getStatusColor(estimate.status)}20`, borderColor: getStatusColor(estimate.status) }]}>
                      <Text style={[styles.estimateStatusText, { color: getStatusColor(estimate.status) }]}>
                        {estimate.status}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.estimateCardBody}>
                    <Text style={styles.estimateAmount}>${estimate.total.toLocaleString()}</Text>
                    <Text style={styles.estimateItems}>{estimate.lineItems.length} line items</Text>
                  </View>

                  <View style={styles.estimateCardFooter}>
                    <Text style={styles.viewDetailsText}>View Details →</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No estimates yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Contractors you contact will send estimates here
              </Text>
            </View>
          )}
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
  statusContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contractorCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  contractorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contractorDetails: {
    flex: 1,
  },
  contractorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  companyName: {
    fontSize: 15,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starRating: {
    color: '#D4AF37',
    fontSize: 14,
    marginRight: 5,
  },
  reviewCount: {
    color: '#999999',
    fontSize: 12,
  },
  contactButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  priceSummaryCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  validityRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  validityText: {
    fontSize: 12,
    color: '#CCCCCC',
    fontStyle: 'italic',
  },
  lineItemsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  categorySection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 5,
  },
  categoryCount: {
    fontSize: 14,
    color: '#999999',
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginRight: 10,
  },
  expandIcon: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  lineItemsContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  lineItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  lineItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  lineItemDescription: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 10,
  },
  lineItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lineItemBottom: {},
  lineItemDetails: {
    fontSize: 12,
    color: '#999999',
  },
  notesSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  rejectButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  acceptedMessage: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  acceptedMessageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  acceptedMessageSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  rejectedMessage: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  rejectedMessageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  metadataSection: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  metadataText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 3,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  // List screen styles
  estimateCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  estimateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  estimateContractor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  estimateDate: {
    fontSize: 12,
    color: '#999999',
  },
  estimateStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  estimateStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  estimateCardBody: {
    marginBottom: 15,
  },
  estimateAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 5,
  },
  estimateItems: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  estimateCardFooter: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  viewDetailsText: {
    fontSize: 15,
    color: '#D4AF37',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default EstimateViewScreen;
