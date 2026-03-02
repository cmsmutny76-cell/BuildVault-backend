import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  online: boolean;
}

interface ChatScreenProps {
  onBack: () => void;
  conversationId?: string;
  contactName?: string;
}

export default function ChatScreen({ onBack, conversationId = '1', contactName = 'Mike Johnson' }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi, I saw your project listing. Are you still looking for a contractor?',
      sender: 'user',
      timestamp: '10:30 AM',
      read: true
    },
    {
      id: '2',
      text: 'Yes! I need help with a kitchen remodel. Are you available for a site visit?',
      sender: 'other',
      timestamp: '10:32 AM',
      read: true
    },
    {
      id: '3',
      text: 'Absolutely. I have availability this Thursday or Friday afternoon. What works best for you?',
      sender: 'user',
      timestamp: '10:35 AM',
      read: true
    },
    {
      id: '4',
      text: 'Friday at 2pm would be perfect. My address is 123 Main Street, Los Angeles.',
      sender: 'other',
      timestamp: '10:37 AM',
      read: true
    },
    {
      id: '5',
      text: 'Great! I\'ll see you Friday at 2pm. I\'ll bring some material samples and design ideas.',
      sender: 'user',
      timestamp: '10:40 AM',
      read: true
    },
    {
      id: '6',
      text: 'Perfect. Looking forward to it!',
      sender: 'other',
      timestamp: '10:42 AM',
      read: true
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: (messages.length + 1).toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      read: false
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

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

          {isTyping && (
            <View style={styles.typingIndicator}>
              <View style={styles.messageAvatar}>
                <Text style={styles.messageAvatarText}>
                  {contactName.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}
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
});
