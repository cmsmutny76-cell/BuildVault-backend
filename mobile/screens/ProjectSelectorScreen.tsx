import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

interface Project {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  projectType: string;
  location: {
    city: string;
    state: string;
    zipCode: string;
    street?: string;
  };
  status: string;
  createdAt: string;
}

interface ProjectSelectorScreenProps {
  currentUserId: string;
  currentProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onCreateNewProject: () => void;
  onBack: () => void;
}

export default function ProjectSelectorScreen({
  currentUserId,
  currentProjectId,
  onSelectProject,
  onCreateNewProject,
  onBack,
}: ProjectSelectorScreenProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/projects');
      const data = await response.json();

      if (data.success) {
        // Filter projects for current user
        const userProjects = data.projects.filter(
          (p: Project) => p.ownerId === currentUserId
        );
        setProjects(userProjects);
      } else {
        Alert.alert('Error', 'Failed to load projects');
      }
    } catch (error) {
      console.error('Fetch projects error:', error);
      Alert.alert('Error', 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getProjectTypeIcon = (projectType: string) => {
    const icons: { [key: string]: string } = {
      residential: '🏠',
      commercial: '🏢',
      apartment: '🏬',
      landscaping: '🌳',
      renovation: '🔨',
      construction: '🏗️',
      repair: '🔧',
    };
    return icons[projectType.toLowerCase()] || '📋';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      planning: '#3b82f6',
      active: '#10b981',
      'on-hold': '#f59e0b',
      completed: '#6b7280',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Project</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Projects Yet</Text>
            <Text style={styles.emptyText}>
              Create your first project to get started
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={onCreateNewProject}
            >
              <Text style={styles.createButtonText}>+ Create Project</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Select a project to use for estimates, messaging, and analysis tools
              </Text>
            </View>

            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.projectCard,
                  project.id === currentProjectId && styles.projectCardSelected,
                ]}
                onPress={() => onSelectProject(project)}
              >
                <View style={styles.projectHeader}>
                  <View style={styles.projectTitleRow}>
                    <Text style={styles.projectIcon}>
                      {getProjectTypeIcon(project.projectType)}
                    </Text>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectTitle}>{project.title}</Text>
                      <Text style={styles.projectType}>{project.projectType}</Text>
                    </View>
                    {project.id === currentProjectId && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>✓ Active</Text>
                      </View>
                    )}
                  </View>
                </View>

                {project.description && (
                  <Text style={styles.projectDescription} numberOfLines={2}>
                    {project.description}
                  </Text>
                )}

                <View style={styles.projectFooter}>
                  <Text style={styles.projectLocation}>
                    📍 {project.location.city}, {project.location.state}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(project.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{project.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.createProjectCard}
              onPress={onCreateNewProject}
            >
              <Text style={styles.createProjectIcon}>+</Text>
              <Text style={styles.createProjectText}>Create New Project</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  projectCardSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  projectHeader: {
    marginBottom: 8,
  },
  projectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  projectType: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  selectedBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  projectDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  createProjectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createProjectIcon: {
    fontSize: 48,
    color: '#667eea',
    marginBottom: 8,
  },
  createProjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
});
