import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MobileScreenHeader from '../components/MobileScreenHeader';

interface CategoryDashboardProps {
  category: 'multi-family' | 'apartment' | 'landscaping' | 'labor-pool' | 'employment' | 'developer' | 'food-service';
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

const categoryConfig = {
  'multi-family': {
    title: 'Multi-Family Housing',
    subtitle: 'Manage apartment complexes, condos, and multi-unit residential projects',
    backgroundImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    icon: '🏘️',
    stats: { properties: 3, units: 156, activeProjects: 4 },
    quickActions: [
      { icon: '🏗️', title: 'New Multi-Family Project', description: 'Start renovation or new construction for multi-unit properties' },
      { icon: '👷', title: 'Find Contractors', description: 'Connect with multi-family construction specialists' },
      { icon: '📊', title: 'Unit Management', description: 'Track projects across multiple units simultaneously' },
      { icon: '🔧', title: 'Maintenance Request', description: 'Submit and track maintenance for common areas' },
    ],
    features: [
      { icon: '🚪', title: 'Common Area Work', description: 'Lobbies, hallways, elevators, and shared spaces' },
      { icon: '🏊', title: 'Amenities', description: 'Pool, gym, clubhouse renovation and upgrades' },
      { icon: '🚗', title: 'Parking & Exterior', description: 'Parking lots, landscaping, and building exterior' },
      { icon: '📡', title: 'Building Systems', description: 'HVAC, plumbing, electrical for multi-unit buildings' },
    ],
  },
  'apartment': {
    title: 'Apartment Projects',
    subtitle: 'Individual apartment renovations and multi-unit coordination',
    backgroundImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
    icon: '🏢',
    stats: { units: 12, activeProjects: 3, completed: 45 },
    quickActions: [
      { icon: '🏠', title: 'Unit Renovation', description: 'Kitchen, bathroom, and full apartment remodels' },
      { icon: '🎨', title: 'Unit Turnover', description: 'Fast-track painting, flooring, and updates between tenants' },
      { icon: '👔', title: 'Find Contractors', description: 'Licensed professionals for apartment work' },
      { icon: '📅', title: 'Schedule Coordination', description: 'Plan work around tenant occupancy' },
    ],
    features: [
      { icon: '⚡', title: 'Quick Turnovers', description: 'Express services for unit-ready preparation' },
      { icon: '🔊', title: 'Noise Management', description: 'Minimize disruption to occupied units' },
      { icon: '🔑', title: 'Tenant Coordination', description: 'Schedule around move-in/move-out dates' },
      { icon: '💰', title: 'Budget Planning', description: 'Cost estimation for multiple units' },
    ],
  },
  'landscaping': {
    title: 'Landscaping Projects',
    subtitle: 'Professional landscape design, installation, and maintenance',
    backgroundImage: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1200&q=80',
    icon: '🌳',
    stats: { properties: 8, activeProjects: 5, sqft: 125000 },
    quickActions: [
      { icon: '🌱', title: 'New Landscape Project', description: 'Design and installation for residential or commercial' },
      { icon: '💧', title: 'Irrigation Systems', description: 'Smart irrigation and water conservation' },
      { icon: '🪨', title: 'Hardscaping', description: 'Patios, walkways, retaining walls, and outdoor structures' },
      { icon: '🌿', title: 'Find Landscapers', description: 'Licensed landscape contractors and designers' },
    ],
    features: [
      { icon: '☀️', title: 'Drought-Tolerant', description: 'Native plants and water-wise landscaping' },
      { icon: '💡', title: 'Outdoor Lighting', description: 'Landscape and architectural lighting design' },
      { icon: '🌺', title: 'Seasonal Planting', description: 'Year-round color and maintenance planning' },
      { icon: '🌊', title: 'Water Features', description: 'Fountains, ponds, and decorative water elements' },
    ],
  },
  'labor-pool': {
    title: 'Labor Pool',
    subtitle: 'General labor, day workers, and project-based crews',
    backgroundImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
    icon: '👷',
    stats: { workers: 45, activeJobs: 12, hiredToday: 8 },
    quickActions: [
      { icon: '👥', title: 'Hire Workers', description: 'Find skilled laborers for your project needs' },
      { icon: '📋', title: 'Post Job', description: 'List your labor requirements and budget' },
      { icon: '⏰', title: 'Day Labor', description: 'Hire workers for same-day or short-term projects' },
      { icon: '🏆', title: 'Crew Leads', description: 'Find experienced foremen and supervisors' },
    ],
    features: [
      { icon: '🔨', title: 'General Labor', description: 'Demolition, hauling, site cleanup, and prep work' },
      { icon: '🧱', title: 'Skilled Trades', description: 'Carpenters, masons, painters, and specialists' },
      { icon: '💪', title: 'Heavy Lifting', description: 'Material handling and equipment operators' },
      { icon: '🏗️', title: 'Project Crews', description: 'Complete teams for large-scale projects' },
    ],
  },
  'employment': {
    title: 'Employment Opportunities',
    subtitle: 'Find construction jobs and career opportunities',
    backgroundImage: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=1200&q=80',
    icon: '💼',
    stats: { openJobs: 234, applications: 45, interviews: 8 },
    quickActions: [
      { icon: '🔍', title: 'Browse Jobs', description: 'Search construction and trade job listings' },
      { icon: '📄', title: 'Submit Resume', description: 'Apply to contractors and construction companies' },
      { icon: '👔', title: 'My Applications', description: 'Track your job applications and responses' },
      { icon: '🎓', title: 'Training Programs', description: 'Certifications and skill development opportunities' },
    ],
    features: [
      { icon: '🏆', title: 'Apprenticeships', description: 'Entry-level positions with training included' },
      { icon: '⚡', title: 'Immediate Hire', description: 'Jobs starting this week or ASAP' },
      { icon: '💰', title: 'Union Jobs', description: ' Licensed trade positions with benefits' },
      { icon: '📊', title: 'Project Management', description: 'Supervisor and coordinator positions' },
    ],
  },
  'developer': {
    title: 'Developer Projects',
    subtitle: 'Large-scale development, property investment, and portfolio management',
    backgroundImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    icon: '🏗️',
    stats: { projects: 12, portfolio: '$45M', inProgress: 5 },
    quickActions: [
      { icon: '🏙️', title: 'New Development', description: 'Plan multi-property or large-scale projects' },
      { icon: '📊', title: 'Portfolio Dashboard', description: 'Track all properties and investments' },
      { icon: '🤝', title: 'General Contractors', description: 'Connect with commercial construction firms' },
      { icon: '💼', title: 'Project Bidding', description: 'Solicit bids from multiple contractors' },
    ],
    features: [
      { icon: '📈', title: 'ROI Analysis', description: 'Cost tracking and return on investment metrics' },
      { icon: '📅', title: 'Timeline Management', description: 'Multi-project scheduling and coordination' },
      { icon: '🏦', title: 'Financing', description: 'Construction loans and project funding' },
      { icon: '🗺️', title: 'Site Planning', description: 'Zoning, permits, and regulatory compliance' },
    ],
  },
  'food-service': {
    title: 'Restaurant & Food Service',
    subtitle: 'Commercial kitchen, dining, and food service construction',
    backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    icon: '🍽️',
    stats: { locations: 6, activeProjects: 2, sqft: 45000 },
    quickActions: [
      { icon: '👨‍🍳', title: 'Kitchen Build-Out', description: 'Commercial kitchen design and construction' },
      { icon: '🏪', title: 'Restaurant Renovation', description: 'Dining room, bar, and customer-facing spaces' },
      { icon: '🔥', title: 'Health Code Compliance', description: 'Ensure all work meets food service regulations' },
      { icon: '🛠️', title: 'Find Specialists', description: 'Contractors experienced in food service' },
    ],
    features: [
      { icon: '❄️', title: 'Refrigeration', description: 'Walk-in coolers, freezers, and cold storage' },
      { icon: '🔥', title: 'Cooking Equipment', description: 'Hood systems, ventilation, and fire suppression' },
      { icon: '💧', title: 'Plumbing & Drains', description: 'Grease traps, triple sinks, and specialized plumbing' },
      { icon: '⚡', title: 'High-Power Electrical', description: 'Commercial-grade electrical for kitchen equipment' },
    ],
  },
};

export default function CategoryDashboard({ category, onBack, onNavigate }: CategoryDashboardProps) {
  const config = categoryConfig[category];

  return (
    <ImageBackground
      source={{ uri: config.backgroundImage }}
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
            title={config.title}
            subtitle={config.subtitle}
            theme="dark"
          />

          {/* Stats Overview */}
          <View style={styles.statsCard}>
            {Object.entries(config.stats).map(([key, value], index) => (
              <React.Fragment key={key}>
                {index > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{typeof value === 'number' ? value : value}</Text>
                  <Text style={styles.statLabel}>
                    {key.split(/(?=[A-Z])/).join(' ').charAt(0).toUpperCase() + 
                     key.split(/(?=[A-Z])/).join(' ').slice(1)}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            {config.quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.actionCard}
                onPress={() => {
                  if (action.title.toLowerCase().includes('find') || action.title.toLowerCase().includes('hire') || action.title.toLowerCase().includes('browse')) {
                    onNavigate('contractorSearch');
                  } else if (action.title.toLowerCase().includes('project') || action.title.toLowerCase().includes('new') || action.title.toLowerCase().includes('start') || action.title.toLowerCase().includes('post')) {
                    onNavigate('projectProfile');
                  } else if (action.title.toLowerCase().includes('resume') || action.title.toLowerCase().includes('application') || action.title.toLowerCase().includes('job') || action.title.toLowerCase().includes('career')) {
                    onNavigate('contractorSearch');
                  } else {
                    onNavigate('photoAnalysis');
                  }
                }}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category-Specific Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialized Services</Text>
            {config.features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerIcon}>💡</Text>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Get Started</Text>
              <Text style={styles.infoBannerText}>
                Create a project profile to get matched with contractors who specialize in {config.title.toLowerCase()}.
              </Text>
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 18,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  featureIcon: {
    fontSize: 26,
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  infoBannerIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
});
