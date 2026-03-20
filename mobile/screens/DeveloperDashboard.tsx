import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Screen } from '../types/navigation';

interface DevelopmentProject {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'mixed-use' | 'industrial';
  location: string;
  units?: number;
  sqft: number;
  budget: number;
  invested: number;
  status: 'planning' | 'permitting' | 'construction' | 'completed';
  completionDate?: string;
  roi: number;
  phase: string;
}

interface DeveloperDashboardProps {
  onBack: () => void;
  onNavigate: (screen: Screen, params?: unknown) => void;
}

export default function DeveloperDashboard({ onBack, onNavigate }: DeveloperDashboardProps) {
  const [projects, setProjects] = useState<DevelopmentProject[]>([
    {
      id: '1',
      name: 'Sunset Residential Complex',
      type: 'residential',
      location: 'Santa Monica, CA',
      units: 120,
      sqft: 145000,
      budget: 28000000,
      invested: 18500000,
      status: 'construction',
      completionDate: '2026-12',
      roi: 18.5,
      phase: 'Phase 2 - Foundation Complete',
    },
    {
      id: '2',
      name: 'Downtown Mixed-Use Tower',
      type: 'mixed-use',
      location: 'Los Angeles, CA',
      units: 85,
      sqft: 220000,
      budget: 65000000,
      invested: 42000000,
      status: 'construction',
      completionDate: '2027-06',
      roi: 22.3,
      phase: 'Phase 3 - Vertical Construction',
    },
    {
      id: '3',
      name: 'Tech Park Business Center',
      type: 'commercial',
      location: 'Irvine, CA',
      sqft: 95000,
      budget: 18500000,
      invested: 5200000,
      status: 'permitting',
      completionDate: '2027-03',
      roi: 15.8,
      phase: 'Permit Review',
    },
    {
      id: '4',
      name: 'Harbor View Condos',
      type: 'residential',
      location: 'Long Beach, CA',
      units: 48,
      sqft: 68000,
      budget: 12500000,
      invested: 12500000,
      status: 'completed',
      completionDate: '2025-11',
      roi: 24.1,
      phase: 'Completed - 95% Sold',
    },
  ]);

  const [selectedProject, setSelectedProject] = useState<DevelopmentProject | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return '#9C27B0';
      case 'permitting': return '#FF9800';
      case 'construction': return '#2196F3';
      case 'completed': return '#4CAF50';
      default: return '#999999';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'residential': return '🏘️';
      case 'commercial': return '🏢';
      case 'mixed-use': return '🏙️';
      case 'industrial': return '🏭';
      default: return '🏗️';
    }
  };

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalInvested = projects.reduce((sum, p) => sum + p.invested, 0);
  const avgROI = projects.reduce((sum, p) => sum + p.roi, 0) / projects.length;
  const activeProjects = projects.filter(p => p.status === 'construction' || p.status === 'permitting').length;

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
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back to Categories</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Developer Portfolio</Text>
            <Text style={styles.headerSubtitle}>
              Manage large-scale development projects and investment portfolio
            </Text>
          </View>

          {/* Portfolio Stats */}
          <View style={styles.portfolioCard}>
            <Text style={styles.portfolioTitle}>Portfolio Overview</Text>
            <View style={styles.portfolioStats}>
              <View style={styles.portfolioStatItem}>
                <Text style={styles.portfolioStatLabel}>Total Portfolio Value</Text>
                <Text style={styles.portfolioStatValue}>${(totalBudget / 1000000).toFixed(1)}M</Text>
              </View>
              <View style={styles.portfolioStatItem}>
                <Text style={styles.portfolioStatLabel}>Invested Capital</Text>
                <Text style={styles.portfolioStatValue}>${(totalInvested / 1000000).toFixed(1)}M</Text>
              </View>
              <View style={styles.portfolioStatItem}>
                <Text style={styles.portfolioStatLabel}>Average ROI</Text>
                <Text style={styles.portfolioStatValue}>{avgROI.toFixed(1)}%</Text>
              </View>
              <View style={styles.portfolioStatItem}>
                <Text style={styles.portfolioStatLabel}>Active Projects</Text>
                <Text style={styles.portfolioStatValue}>{activeProjects}</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{projects.length}</Text>
              <Text style={styles.quickStatLabel}>Total Projects</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>
                {projects.filter(p => p.units).reduce((sum, p) => sum + (p.units || 0), 0)}
              </Text>
              <Text style={styles.quickStatLabel}>Total Units</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>
                {(projects.reduce((sum, p) => sum + p.sqft, 0) / 1000).toFixed(0)}k
              </Text>
              <Text style={styles.quickStatLabel}>Total Sq Ft</Text>
            </View>
          </View>

          {/* Projects */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Development Projects</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => Alert.alert('New Project', 'Start planning a new development')}
              >
                <Text style={styles.addButtonText}>+ New Project</Text>
              </TouchableOpacity>
            </View>

            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={styles.projectCard}
                onPress={() => setSelectedProject(project)}
              >
                <View style={styles.projectHeader}>
                  <View style={styles.projectTitleRow}>
                    <Text style={styles.projectIcon}>{getTypeIcon(project.type)}</Text>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectName}>{project.name}</Text>
                      <Text style={styles.projectLocation}>📍 {project.location}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                    <Text style={styles.statusText}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.projectPhase}>{project.phase}</Text>

                <View style={styles.projectDetails}>
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>Type</Text>
                    <Text style={styles.detailValue}>
                      {project.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Text>
                  </View>
                  {project.units && (
                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>Units</Text>
                      <Text style={styles.detailValue}>{project.units}</Text>
                    </View>
                  )}
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>Sq Ft</Text>
                    <Text style={styles.detailValue}>{(project.sqft / 1000).toFixed(0)}k</Text>
                  </View>
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>ROI</Text>
                    <Text style={[styles.detailValue, { color: '#4CAF50' }]}>{project.roi}%</Text>
                  </View>
                </View>

                <View style={styles.budgetBar}>
                  <View style={styles.budgetInfo}>
                    <Text style={styles.budgetLabel}>Budget Progress</Text>
                    <Text style={styles.budgetAmount}>
                      ${(project.invested / 1000000).toFixed(1)}M / ${(project.budget / 1000000).toFixed(1)}M
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(project.invested / project.budget) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>

                {project.completionDate && (
                  <Text style={styles.completionDate}>
                    {project.status === 'completed' ? 'Completed: ' : 'Target: '} {project.completionDate}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Development Tools</Text>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Site Analysis', 'Assess potential development sites')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Site Analysis & Feasibility</Text>
                <Text style={styles.actionDescription}>
                  Evaluate land, zoning, and development potential
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => onNavigate('contractorSearch')}
            >
              <Text style={styles.actionIcon}>🏗️</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>General Contractors</Text>
                <Text style={styles.actionDescription}>
                  Find experienced GCs for large-scale development
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Bidding', 'Manage competitive bidding process')}
            >
              <Text style={styles.actionIcon}>💼</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Bidding & Procurement</Text>
                <Text style={styles.actionDescription}>
                  Send RFPs and compare contractor bids
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Financing', 'Track funding, loans, and investors')}
            >
              <Text style={styles.actionIcon}>💰</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Financing & Capital</Text>
                <Text style={styles.actionDescription}>
                  Manage funding sources and investment partners
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Development Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Development Management</Text>

            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>📈</Text>
                <Text style={styles.featureTitle}>ROI Analysis</Text>
                <Text style={styles.featureDescription}>
                  Track returns and profitability across portfolio
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>⏱️</Text>
                <Text style={styles.featureTitle}>Timeline Management</Text>
                <Text style={styles.featureDescription}>
                  Monitor critical paths and milestones
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>💵</Text>
                <Text style={styles.featureTitle}>Financing</Text>
                <Text style={styles.featureDescription}>
                  Construction loans and investor relations
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>🗺️</Text>
                <Text style={styles.featureTitle}>Site Planning</Text>
                <Text style={styles.featureDescription}>
                  Zoning, land use, and master planning
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>📋</Text>
                <Text style={styles.featureTitle}>Permit Tracking</Text>
                <Text style={styles.featureDescription}>
                  Navigate approvals and inspections
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>👥</Text>
                <Text style={styles.featureTitle}>Stakeholder Mgmt</Text>
                <Text style={styles.featureDescription}>
                  Coordinate investors and partners
                </Text>
              </View>
            </View>
          </View>

          {/* Analytics Tools */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio Analytics</Text>

            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsIcon}>📊</Text>
              <View style={styles.analyticsContent}>
                <Text style={styles.analyticsTitle}>Investment Performance</Text>
                <Text style={styles.analyticsDescription}>
                  View detailed ROI, cash flow, and return metrics across all projects
                </Text>
              </View>
            </View>

            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsIcon}>💹</Text>
              <View style={styles.analyticsContent}>
                <Text style={styles.analyticsTitle}>Market Analysis</Text>
                <Text style={styles.analyticsDescription}>
                  Track real estate trends, comps, and development opportunities
                </Text>
              </View>
            </View>

            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsIcon}>⚠️</Text>
              <View style={styles.analyticsContent}>
                <Text style={styles.analyticsTitle}>Risk Management</Text>
                <Text style={styles.analyticsDescription}>
                  Identify and mitigate project risks and budget overruns
                </Text>
              </View>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              💡 Large-scale development? Connect with experienced general contractors who specialize in multi-phase projects.
            </Text>
          </View>
        </ScrollView>

        {/* Project Detail Modal */}
        {selectedProject && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSelectedProject(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalIcon}>{getTypeIcon(selectedProject.type)}</Text>
                    <View style={styles.modalHeaderText}>
                      <Text style={styles.modalTitle}>{selectedProject.name}</Text>
                      <Text style={styles.modalLocation}>📍 {selectedProject.location}</Text>
                    </View>
                  </View>

                  <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedProject.status) }]}>
                    <Text style={styles.modalStatusText}>
                      {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)} - {selectedProject.phase}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Project Details</Text>
                    <View style={styles.modalDetailGrid}>
                      <View style={styles.modalDetailItem}>
                        <Text style={styles.modalDetailLabel}>Type</Text>
                        <Text style={styles.modalDetailValue}>
                          {selectedProject.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </Text>
                      </View>
                      {selectedProject.units && (
                        <View style={styles.modalDetailItem}>
                          <Text style={styles.modalDetailLabel}>Units</Text>
                          <Text style={styles.modalDetailValue}>{selectedProject.units}</Text>
                        </View>
                      )}
                      <View style={styles.modalDetailItem}>
                        <Text style={styles.modalDetailLabel}>Square Footage</Text>
                        <Text style={styles.modalDetailValue}>{selectedProject.sqft.toLocaleString()}</Text>
                      </View>
                      {selectedProject.completionDate && (
                        <View style={styles.modalDetailItem}>
                          <Text style={styles.modalDetailLabel}>Target Completion</Text>
                          <Text style={styles.modalDetailValue}>{selectedProject.completionDate}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Financial Overview</Text>
                    <View style={styles.modalFinancial}>
                      <View style={styles.modalFinancialItem}>
                        <Text style={styles.modalFinancialLabel}>Total Budget</Text>
                        <Text style={styles.modalFinancialValue}>
                          ${(selectedProject.budget / 1000000).toFixed(2)}M
                        </Text>
                      </View>
                      <View style={styles.modalFinancialItem}>
                        <Text style={styles.modalFinancialLabel}>Invested</Text>
                        <Text style={styles.modalFinancialValue}>
                          ${(selectedProject.invested / 1000000).toFixed(2)}M
                        </Text>
                      </View>
                      <View style={styles.modalFinancialItem}>
                        <Text style={styles.modalFinancialLabel}>Remaining</Text>
                        <Text style={styles.modalFinancialValue}>
                          ${((selectedProject.budget - selectedProject.invested) / 1000000).toFixed(2)}M
                        </Text>
                      </View>
                      <View style={styles.modalFinancialItem}>
                        <Text style={styles.modalFinancialLabel}>Projected ROI</Text>
                        <Text style={[styles.modalFinancialValue, { color: '#4CAF50' }]}>
                          {selectedProject.roi}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedProject(null);
                      onNavigate('contractorSearch');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Find General Contractors</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedProject(null);
                      Alert.alert('Project Management', 'View detailed project timeline and tasks');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Manage Project</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButtonSecondary}
                    onPress={() => setSelectedProject(null)}
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
  portfolioCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 15,
  },
  portfolioStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  portfolioStatItem: {
    width: '50%',
    marginBottom: 15,
  },
  portfolioStatLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  portfolioStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 5,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#CCCCCC',
    textAlign: 'center',
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
  projectCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  projectIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  projectLocation: {
    fontSize: 13,
    color: '#CCCCCC',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  projectPhase: {
    fontSize: 14,
    color: '#D4AF37',
    marginBottom: 15,
    fontWeight: '600',
  },
  projectDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailColumn: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  budgetBar: {
    marginBottom: 10,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  budgetAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },
  completionDate: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
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
  analyticsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  analyticsIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  analyticsContent: {
    flex: 1,
  },
  analyticsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  analyticsDescription: {
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
    alignItems: 'center',
    marginBottom: 15,
  },
  modalIcon: {
    fontSize: 40,
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
  modalLocation: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalStatusText: {
    fontSize: 13,
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
    marginBottom: 12,
  },
  modalDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalDetailItem: {
    width: '50%',
    marginBottom: 12,
  },
  modalDetailLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 3,
  },
  modalDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D4AF37',
  },
  modalFinancial: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
  },
  modalFinancialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalFinancialLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  modalFinancialValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
