import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  online: boolean;
}

interface MessagingListScreenProps {
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

export default function MessagingListScreen({ onBack, onNavigate }: MessagingListScreenProps) {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      name: 'Mike Johnson',
      lastMessage: 'Great! I\'ll see you Friday at 2pm.',
      timestamp: '10:40 AM',
      unread: 0,
      avatar: 'MJ',
      online: true
    },
    {
      id: '2',
      name: 'Premium Build Construction',
      lastMessage: 'We can start the project next Monday if that works for you.',
      timestamp: 'Yesterday',
      unread: 2,
      avatar: 'PB',
      online: false
    },
    {
      id: '3',
      name: 'Sarah Martinez - Bright Star Electric',
      lastMessage: 'I\'m sending over the revised electrical quote.',
      timestamp: 'Yesterday',
      unread: 1,
      avatar: 'SM',
      online: true
    },
    {
      id: '4',
      name: 'David Chen',
      lastMessage: 'Thanks for choosing us! Looking forward to starting your project.',
      timestamp: 'Tuesday',
      unread: 0,
      avatar: 'DC',
      online: false
    },
    {
      id: '5',
      name: 'Master Flow Plumbing',
      lastMessage: 'The permit was approved. We can schedule the rough-in.',
      timestamp: 'Monday',
      unread: 3,
      avatar: 'MF',
      online: true
    },
    {
      id: '6',
      name: 'Jennifer Lee',
      lastMessage: 'I have some material samples to show you.',
      timestamp: 'Last week',
      unread: 0,
      avatar: 'JL',
      online: false
    },
    {
      id: '7',
      name: 'Tom Rivera - Climate Control',
      lastMessage: 'Your HVAC system is ready for installation.',
      timestamp: 'Last week',
      unread: 0,
      avatar: 'TR',
      online: false
    },
  ]);

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unread, 0);

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80' }}
      style={styles.backgroundImage}
      blurRadius={5}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.9)']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{conversations.length}</Text>
            <Text style={styles.statLabel}>Conversations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{conversations.filter(c => c.online).length}</Text>
            <Text style={styles.statLabel}>Online Now</Text>
          </View>
        </View>

        {/* Conversations List */}
        <ScrollView 
          style={styles.conversationsList}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Conversations</Text>

            {conversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                style={styles.conversationCard}
                onPress={() => onNavigate('chat', { conversationId: conversation.id, contactName: conversation.name })}
              >
                <View style={styles.conversationAvatar}>
                  <Text style={styles.conversationAvatarText}>{conversation.avatar}</Text>
                  {conversation.online && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>{conversation.name}</Text>
                    <Text style={styles.conversationTime}>{conversation.timestamp}</Text>
                  </View>
                  <View style={styles.conversationFooter}>
                    <Text 
                      style={[
                        styles.conversationMessage,
                        conversation.unread > 0 && styles.conversationMessageUnread
                      ]}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage}
                    </Text>
                    {conversation.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{conversation.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🔍</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Find Contractors</Text>
                <Text style={styles.actionDescription}>
                  Browse and message contractors for your project
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📝</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Post a Project</Text>
                <Text style={styles.actionDescription}>
                  Create a listing and receive messages from interested contractors
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>⭐</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>My Favorites</Text>
                <Text style={styles.actionDescription}>
                  View and message your saved contractors
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              💬 Messages are secure and encrypted. We never share your contact information without permission.
            </Text>
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
  conversationsList: {
    flex: 1,
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
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  conversationAvatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  conversationAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#000000',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  conversationTime: {
    fontSize: 12,
    color: '#999999',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationMessage: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
    marginRight: 10,
  },
  conversationMessageUnread: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700',
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  actionDescription: {
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
});
