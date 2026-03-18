export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  projectId?: string;
  timestamp: string;
  read: boolean;
  attachments: string[];
}

export interface MessageParticipantInfo {
  id: string;
  name: string;
  type: 'contractor' | 'homeowner' | string;
  avatar?: string;
}

export interface MessageConversation {
  id: string;
  participants: string[];
  participantInfo: MessageParticipantInfo;
  projectId?: string;
  projectTitle?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
}

export interface MessageEventPayload {
  type: 'message:new';
  userId: string;
  message: MessageRecord;
}
