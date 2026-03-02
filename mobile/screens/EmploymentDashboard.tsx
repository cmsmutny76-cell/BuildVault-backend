import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  experience: string;
  salary: string;
  postedDate: string;
  applications: number;
  description: string;
  requirements: string[];
  benefits: string[];
  isUrgent: boolean;
  contactName: string;
  contactPhone: string;
}

interface EmploymentDashboardProps {
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

export default function EmploymentDashboard({ onBack, onNavigate }: EmploymentDashboardProps) {
  const [jobs, setJobs] = useState<JobListing[]>([
    {
      id: '1',
      title: 'Lead Carpenter',
      company: 'Premium Build Construction',
      location: 'Los Angeles, CA',
      type: 'full-time',
      experience: '5+ years',
      salary: '$65,000 - $85,000/year',
      postedDate: '2 days ago',
      applications: 12,
      isUrgent: true,
      description: 'We are seeking an experienced Lead Carpenter to oversee framing and finish work on high-end residential projects. Must have strong leadership skills and attention to detail.',
      requirements: [
        '5+ years of carpentry experience',
        'Valid driver\'s license',
        'Own tools required',
        'Ability to read blueprints',
        'Leadership experience',
        'Reliable transportation'
      ],
      benefits: [
        'Health insurance',
        'Paid time off',
        '401(k) matching',
        'Tool allowance',
        'Ongoing training'
      ],
      contactName: 'Mike Johnson',
      contactPhone: '(323) 555-0145'
    },
    {
      id: '2',
      title: 'Commercial Electrician',
      company: 'Bright Star Electric',
      location: 'Long Beach, CA',
      type: 'full-time',
      experience: '3-5 years',
      salary: '$55,000 - $75,000/year',
      postedDate: '1 week ago',
      applications: 24,
      isUrgent: false,
      description: 'Looking for a licensed electrician to join our commercial projects team. Projects include office buildings, retail spaces, and industrial facilities.',
      requirements: [
        'Valid CA electrician license',
        '3+ years commercial experience',
        'Conduit bending experience',
        'Blueprint reading',
        'Clean driving record',
        'Pass drug test'
      ],
      benefits: [
        'Union wages',
        'Full health benefits',
        'Pension plan',
        'Company truck',
        'Overtime available'
      ],
      contactName: 'Sarah Martinez',
      contactPhone: '(562) 555-0198'
    },
    {
      id: '3',
      title: 'Project Manager',
      company: 'Downtown Development Group',
      location: 'Los Angeles, CA',
      type: 'full-time',
      experience: '7+ years',
      salary: '$90,000 - $120,000/year',
      postedDate: '3 days ago',
      applications: 8,
      isUrgent: true,
      description: 'Seeking an experienced Project Manager to oversee multiple commercial and mixed-use development projects. Must have strong organizational and communication skills.',
      requirements: [
        '7+ years construction management',
        'Bachelor\'s degree preferred',
        'PMP certification a plus',
        'Experience with large budgets',
        'Proficient in project software',
        'Strong client relations'
      ],
      benefits: [
        'Competitive salary',
        'Performance bonuses',
        'Full benefits package',
        'Company vehicle',
        'Professional development'
      ],
      contactName: 'David Chen',
      contactPhone: '(213) 555-0167'
    },
    {
      id: '4',
      title: 'Plumbing Apprentice',
      company: 'Master Flow Plumbing',
      location: 'Pasadena, CA',
      type: 'full-time',
      experience: 'Entry level',
      salary: '$18 - $22/hour',
      postedDate: '5 days ago',
      applications: 31,
      isUrgent: false,
      description: 'Entry-level opportunity for motivated individuals looking to start a career in plumbing. We provide comprehensive on-the-job training and support your apprenticeship registration.',
      requirements: [
        'High school diploma or GED',
        '18+ years old',
        'Valid driver\'s license',
        'Physically fit',
        'Willing to learn',
        'Reliable and punctual'
      ],
      benefits: [
        'Paid training',
        'Apprenticeship sponsorship',
        'Health insurance after 90 days',
        'Tool allowance',
        'Advancement opportunities'
      ],
      contactName: 'Robert Thompson',
      contactPhone: '(626) 555-0123'
    },
    {
      id: '5',
      title: 'Construction Superintendent',
      company: 'Pacific Coast Builders',
      location: 'Orange County, CA',
      type: 'full-time',
      experience: '10+ years',
      salary: '$95,000 - $130,000/year',
      postedDate: '1 day ago',
      applications: 5,
      isUrgent: true,
      description: 'Seeking an experienced Superintendent for large-scale residential development projects. Must have proven track record managing multiple crews and ensuring quality and safety.',
      requirements: [
        '10+ years field experience',
        '5+ years superintendent role',
        'OSHA 30 certification',
        'Multi-family experience',
        'Schedule management expertise',
        'Strong safety record'
      ],
      benefits: [
        'Excellent compensation',
        'Vehicle allowance',
        'Full benefits',
        'Bonus opportunities',
        'Retirement matching'
      ],
      contactName: 'Jennifer Lee',
      contactPhone: '(714) 555-0189'
    },
    {
      id: '6',
      title: 'HVAC Technician',
      company: 'Climate Control Systems',
      location: 'Burbank, CA',
      type: 'full-time',
      experience: '2-4 years',
      salary: '$50,000 - $70,000/year',
      postedDate: '1 week ago',
      applications: 18,
      isUrgent: false,
      description: 'Join our growing HVAC team servicing commercial and residential properties. Must be EPA certified and have experience with installation and service.',
      requirements: [
        'EPA certification required',
        '2+ years HVAC experience',
        'Valid driver\'s license',
        'Own basic tools',
        'Customer service skills',
        'On-call availability'
      ],
      benefits: [
        'Competitive pay',
        'Company van',
        'Health insurance',
        'Paid training',
        'Commission opportunities'
      ],
      contactName: 'Tom Rivera',
      contactPhone: '(818) 555-0156'
    },
  ]);

  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return '#4CAF50';
      case 'part-time': return '#FF9800';
      case 'contract': return '#2196F3';
      default: return '#999999';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const jobTypes = ['all', 'full-time', 'part-time', 'contract'];

  const filteredJobs = filterType === 'all' 
    ? jobs 
    : jobs.filter(j => j.type === filterType);

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80' }}
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
            <Text style={styles.headerTitle}>Job Opportunities</Text>
            <Text style={styles.headerSubtitle}>
              Find your next construction career opportunity
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{jobs.length}</Text>
              <Text style={styles.statLabel}>Open Positions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{jobs.filter(j => j.isUrgent).length}</Text>
              <Text style={styles.statLabel}>Urgent Hiring</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{jobs.filter(j => j.experience === 'Entry level').length}</Text>
              <Text style={styles.statLabel}>Entry Level</Text>
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filter by Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {jobTypes.map((type) => (
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
                    {type === 'all' ? 'All Jobs' : getTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Job Listings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Openings ({filteredJobs.length})</Text>

            {filteredJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={[styles.jobCard, job.isUrgent && styles.jobCardUrgent]}
                onPress={() => setSelectedJob(job)}
              >
                {job.isUrgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>🔥 URGENT HIRING</Text>
                  </View>
                )}

                <View style={styles.jobHeader}>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobCompany}>{job.company}</Text>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: getTypeColor(job.type) }]}>
                    <Text style={styles.typeText}>{getTypeLabel(job.type)}</Text>
                  </View>
                </View>

                <View style={styles.jobDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{job.location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>💰</Text>
                    <Text style={styles.detailText}>{job.salary}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📊</Text>
                    <Text style={styles.detailText}>Experience: {job.experience}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🕒</Text>
                    <Text style={styles.detailText}>Posted {job.postedDate}</Text>
                  </View>
                </View>

                <View style={styles.jobFooter}>
                  <Text style={styles.applicationsText}>
                    {job.applications} applications
                  </Text>
                  <Text style={styles.viewDetailsText}>View Details →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Apply Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Apply</Text>

            <View style={styles.quickApplyCard}>
              <Text style={styles.quickApplyIcon}>📝</Text>
              <View style={styles.quickApplyContent}>
                <Text style={styles.quickApplyTitle}>Upload Your Resume</Text>
                <Text style={styles.quickApplyDescription}>
                  Apply to multiple jobs instantly with one click
                </Text>
                <TouchableOpacity 
                  style={styles.quickApplyButton}
                  onPress={() => Alert.alert('Resume Upload', 'Upload your resume for quick apply')}
                >
                  <Text style={styles.quickApplyButtonText}>Upload Resume</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.quickApplyCard}>
              <Text style={styles.quickApplyIcon}>🔔</Text>
              <View style={styles.quickApplyContent}>
                <Text style={styles.quickApplyTitle}>Job Alerts</Text>
                <Text style={styles.quickApplyDescription}>
                  Get notified when new jobs match your criteria
                </Text>
                <TouchableOpacity 
                  style={styles.quickApplyButton}
                  onPress={() => Alert.alert('Job Alerts', 'Set up job alerts')}
                >
                  <Text style={styles.quickApplyButtonText}>Set Up Alerts</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Popular Companies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Companies Hiring Now</Text>

            <TouchableOpacity style={styles.companyCard}>
              <Text style={styles.companyIcon}>🏗️</Text>
              <View style={styles.companyContent}>
                <Text style={styles.companyName}>Premium Build Construction</Text>
                <Text style={styles.companyJobs}>3 open positions</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.companyCard}>
              <Text style={styles.companyIcon}>⚡</Text>
              <View style={styles.companyContent}>
                <Text style={styles.companyName}>Bright Star Electric</Text>
                <Text style={styles.companyJobs}>5 open positions</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.companyCard}>
              <Text style={styles.companyIcon}>🔧</Text>
              <View style={styles.companyContent}>
                <Text style={styles.companyName}>Master Flow Plumbing</Text>
                <Text style={styles.companyJobs}>2 open positions</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              💼 New opportunities posted daily! Enable job alerts to be the first to apply.
            </Text>
          </View>
        </ScrollView>

        {/* Job Detail Modal */}
        {selectedJob && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSelectedJob(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {selectedJob.isUrgent && (
                    <View style={styles.modalUrgentBanner}>
                      <Text style={styles.modalUrgentText}>🔥 URGENT HIRING - Apply Today!</Text>
                    </View>
                  )}

                  <View style={[styles.modalTypeBadge, { backgroundColor: getTypeColor(selectedJob.type) }]}>
                    <Text style={styles.modalTypeText}>{getTypeLabel(selectedJob.type)}</Text>
                  </View>

                  <Text style={styles.modalTitle}>{selectedJob.title}</Text>
                  <Text style={styles.modalCompany}>{selectedJob.company}</Text>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Job Details</Text>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Location:</Text>
                      <Text style={styles.modalDetailValue}>{selectedJob.location}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Salary:</Text>
                      <Text style={styles.modalDetailValue}>{selectedJob.salary}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Experience:</Text>
                      <Text style={styles.modalDetailValue}>{selectedJob.experience}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Posted:</Text>
                      <Text style={styles.modalDetailValue}>{selectedJob.postedDate}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Applications:</Text>
                      <Text style={styles.modalDetailValue}>{selectedJob.applications} applicants</Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Job Description</Text>
                    <Text style={styles.modalDescription}>{selectedJob.description}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Requirements</Text>
                    {selectedJob.requirements.map((req, index) => (
                      <Text key={index} style={styles.modalListItem}>• {req}</Text>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Benefits</Text>
                    {selectedJob.benefits.map((benefit, index) => (
                      <Text key={index} style={styles.modalBenefitItem}>✓ {benefit}</Text>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Contact Information</Text>
                    <Text style={styles.modalContactText}>
                      Hiring Manager: {selectedJob.contactName}
                    </Text>
                    <Text style={styles.modalContactText}>
                      Phone: {selectedJob.contactPhone}
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedJob(null);
                      Alert.alert('Apply', `Submit application for ${selectedJob.title}`);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Apply Now</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedJob(null);
                      Alert.alert('Save', 'Job saved to your favorites');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Save Job</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalButtonSecondary}
                    onPress={() => setSelectedJob(null)}
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
  jobCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  jobCardUrgent: {
    borderColor: '#FF4444',
    borderWidth: 2,
  },
  urgentBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  jobCompany: {
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
  jobDetails: {
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
  jobFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationsText: {
    fontSize: 12,
    color: '#999999',
  },
  viewDetailsText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
  },
  quickApplyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickApplyIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  quickApplyContent: {
    flex: 1,
  },
  quickApplyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  quickApplyDescription: {
    fontSize: 13,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  quickApplyButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  quickApplyButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  companyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  companyIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  companyContent: {
    flex: 1,
  },
  companyName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  companyJobs: {
    fontSize: 13,
    color: '#D4AF37',
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
  modalUrgentBanner: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 15,
  },
  modalUrgentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
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
  modalCompany: {
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
  modalDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
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
  modalContactText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
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
