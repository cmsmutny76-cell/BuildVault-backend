import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import MobileScreenHeader from '../components/MobileScreenHeader';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function SettingsScreen({ onBack, onLogout }: SettingsScreenProps) {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoSave, setAutoSave] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <MobileScreenHeader
        onBack={onBack}
        backLabel="← Back"
        title="Settings"
        subtitle="Manage preferences and notifications"
        theme="dark"
      />

      <ScrollView style={styles.content}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications for new leads and updates
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications ? '#007AFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Alerts</Text>
              <Text style={styles.settingDescription}>
                Get email notifications for important updates
              </Text>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={emailAlerts ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-Save Projects</Text>
              <Text style={styles.settingDescription}>
                Automatically save project changes
              </Text>
            </View>
            <Switch
              value={autoSave}
              onValueChange={setAutoSave}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={autoSave ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionLabel}>Change Password</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionLabel}>Privacy Policy</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionLabel}>Terms of Service</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionLabel}>Help Center</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionLabel}>Contact Support</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionLabel}>Report a Bug</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCopyright}>© 2026 BuildVault</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
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
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginTop: 20,
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.22)',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.12)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#94a3b8',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.12)',
  },
  actionLabel: {
    fontSize: 16,
    color: '#e2e8f0',
  },
  actionArrow: {
    fontSize: 24,
    color: '#D4AF37',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  appVersion: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 5,
  },
  appCopyright: {
    fontSize: 12,
    color: '#94a3b8',
  },
  logoutButton: {
    backgroundColor: 'rgba(127, 29, 29, 0.18)',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
