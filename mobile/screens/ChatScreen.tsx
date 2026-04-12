import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { messageAPI } from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
  read: boolean;
}

interface ChatScreenProps {
  onBack: () => void;
  conversationId?: string;
  contactName?: string;
  currentUserId: string;
}

// Helper to format message timestamp
function formatMessageTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ChatScreen({ onBack, conversationId = '1', contactName = 'Mike Johnson', currentUserId }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [conversationId, currentUserId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await messageAPI.getMessages(currentUserId, conversationId);

      if (data.success && data.messages) {
        // Transform API messages to our Message interface
        const transformed: Message[] = data.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.senderId === currentUserId ? 'user' : 'other',
          timestamp: formatMessageTime(msg.timestamp),
          read: msg.read,
        }));

        setMessages(transformed);
      } else {
        // Empty conversation
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Optimistically add message to UI
      const tempMessage: Message = {
        id: 'temp_' + Date.now(),
        text: messageText,
        sender: 'user',
        timestamp: formatMessageTime(new Date().toISOString()),
        read: false,
      };

      setMessages(prev => [...prev, tempMessage]);

      // Send to API
      const data = await messageAPI.sendMessage({
        conversationId,
        senderId: currentUserId,
        receiverId: 'user_2', // TODO: Get from conversation data
        content: messageText,
      });

      if (data.success && data.message) {
        // Replace temp message with server message
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? {
                id: data.message.id,
                text: data.message.content,
                sender: 'user',
                timestamp: formatMessageTime(data.message.timestamp),
                read: false,
              }
            : msg
        ));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could show error toast here
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80' }}
        style={styles.backgroundImage}
        blurRadius={8}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.95)']}
          style={styles.container}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contactName}</Text>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80' }}
      style={styles.backgroundImage}
      blurRadius={8}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.95)']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.contactInfo}>
            <View style={styles.contactAvatar}>
              <Text style={styles.contactAvatarText}>
                {contactName.split(' ').map(n => n[0]).join('')}
              </Text>
              <View style={styles.onlineIndicator} />
            </View>
            <View>
              <Text style={styles.contactName}>{contactName}</Text>
              <Text style={styles.contactStatus}>Active now</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView 
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.sender === 'user' ? styles.messageWrapperUser : styles.messageWrapperOther
              ]}
            >
              {message.sender === 'other' && (
                <View style={styles.messageAvatar}>
                  <Text style={styles.messageAvatarText}>
                    {contactName.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.sender === 'user' ? styles.messageBubbleUser : styles.messageBubbleOther
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' ? styles.messageTextUser : styles.messageTextOther
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.sender === 'user' ? styles.messageTimeUser : styles.messageTimeOther
                  ]}
                >
                  {message.timestamp}
                </Text>
              </View>
            </View>
          ))}

          {/* Typing indicator - TODO: implement */}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Text style={styles.attachButtonText}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, newMessage.trim() === '' && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={newMessage.trim() === ''}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  contactAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#000000',
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  contactStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '80%',
  },
  messageWrapperUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageWrapperOther: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
  },
  messageBubbleUser: {
    backgroundColor: '#D4AF37',
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTextUser: {
    color: '#000000',
  },
  messageTextOther: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 2,
  },
  messageTimeUser: {
    color: 'rgba(0,0,0,0.6)',
    textAlign: 'right',
  },
  messageTimeOther: {
    color: 'rgba(255,255,255,0.6)',
  },
  typingIndicator: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '80%',
  },
  typingBubble: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    paddingHorizontal: 16,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 0.4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachButtonText: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: '600',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sendButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#CCCCCC',
  },
});
