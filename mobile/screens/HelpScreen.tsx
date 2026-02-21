import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

interface HelpScreenProps {
  onBack: () => void;
}

export default function HelpScreen({ onBack }: HelpScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
        </View>

        {/* Quick Links */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>❓ How Can We Help?</Text>
          
          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpIcon}>📚</Text>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Getting Started Guide</Text>
              <Text style={styles.helpDescription}>Learn the basics of using the app</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpIcon}>💬</Text>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Contact Support</Text>
              <Text style={styles.helpDescription}>Get help from our team</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpIcon}>📖</Text>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>FAQs</Text>
              <Text style={styles.helpDescription}>Find answers to common questions</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpIcon}>🎥</Text>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Video Tutorials</Text>
              <Text style={styles.helpDescription}>Watch step-by-step guides</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need Immediate Help?</Text>
          <Text style={styles.contactInfo}>Email: support@constructionapp.com</Text>
          <Text style={styles.contactInfo}>Phone: 1-800-BUILD-IT</Text>
          <Text style={styles.contactInfo}>Hours: Mon-Fri 8am-6pm EST</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  helpIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    color: '#94a3b8',
  },
  contactCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
  },
  contactInfo: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 8,
  },
});
