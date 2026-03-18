import { sendNewMessageEmail } from '../email';
import { dbQuery, isDatabaseEnabled } from '../db';
import { type MessageConversation, type MessageRecord } from '../domain/message';
import { logPlatformEvent } from '../eventLogger';
import { publishMessageEvent } from '../messageBus';
import { getAuthUserById } from './authService';

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  project_id: string | null;
  content: string;
  read: boolean;
  attachments: string[];
  created_at: Date;
}

function mapMessageRow(row: MessageRow): MessageRecord {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    projectId: row.project_id || undefined,
    content: row.content,
    read: row.read,
    attachments: row.attachments || [],
    timestamp: new Date(row.created_at).toISOString(),
  };
}

export async function listMessagesForConversation(conversationId: string): Promise<MessageRecord[]> {
  if (isDatabaseEnabled()) {
    const rows = await dbQuery<MessageRow>('SELECT * FROM app_messages WHERE conversation_id = $1 ORDER BY created_at ASC', [conversationId]);
    return rows.map(mapMessageRow);
  }

  return [
    {
      id: 'msg_1',
      conversationId,
      senderId: 'user_1',
      receiverId: 'user_2',
      content: 'Hi, I received your quote for the kitchen remodel. I have a few questions.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true,
      attachments: [],
    },
    {
      id: 'msg_2',
      conversationId,
      senderId: 'user_2',
      receiverId: 'user_1',
      content: "Of course! I'd be happy to answer any questions you have.",
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      read: true,
      attachments: [],
    },
    {
      id: 'msg_3',
      conversationId,
      senderId: 'user_1',
      receiverId: 'user_2',
      content: 'Can we use different cabinet materials to reduce the cost?',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      read: true,
      attachments: [],
    },
    {
      id: 'msg_4',
      conversationId,
      senderId: 'user_2',
      receiverId: 'user_1',
      content: 'Absolutely! We can look at some alternatives. I can prepare a revised quote with different cabinet options.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
      attachments: [],
    },
  ];
}

export async function listConversationsForUser(userId: string): Promise<MessageConversation[]> {
  if (isDatabaseEnabled()) {
    const rows = await dbQuery<MessageRow>(
      `SELECT * FROM app_messages WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const latestByConversation = new Map<string, MessageConversation>();
    for (const row of rows) {
      if (latestByConversation.has(row.conversation_id)) {
        continue;
      }

      const otherParticipantId = row.sender_id === userId ? row.receiver_id : row.sender_id;
      latestByConversation.set(row.conversation_id, {
        id: row.conversation_id,
        participants: [row.sender_id, row.receiver_id],
        participantInfo: {
          id: otherParticipantId,
          name: otherParticipantId,
          type: 'user',
        },
        projectId: row.project_id || undefined,
        projectTitle: row.project_id || undefined,
        lastMessage: {
          content: row.content,
          timestamp: new Date(row.created_at).toISOString(),
          senderId: row.sender_id,
        },
        unreadCount: 0,
      });
    }

    return Array.from(latestByConversation.values());
  }

  return [
    {
      id: 'conv_1',
      participants: ['user_1', 'user_2'],
      participantInfo: {
        id: 'user_2',
        name: 'John Builder',
        type: 'contractor',
        avatar: '👷',
      },
      projectId: 'proj_1',
      projectTitle: 'Kitchen Remodel',
      lastMessage: {
        content: 'Absolutely! We can look at some alternatives.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        senderId: 'user_2',
      },
      unreadCount: 1,
    },
    {
      id: 'conv_2',
      participants: ['user_1', 'user_3'],
      participantInfo: {
        id: 'user_3',
        name: 'Premium Builders LLC',
        type: 'contractor',
        avatar: '🏗️',
      },
      projectId: 'proj_2',
      projectTitle: 'Bathroom Renovation',
      lastMessage: {
        content: "I've sent you the updated timeline",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        senderId: 'user_3',
      },
      unreadCount: 0,
    },
  ];
}

export async function sendMessage(input: {
  conversationId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  projectId?: string;
  attachments?: string[];
}): Promise<MessageRecord> {
  const message: MessageRecord = {
    id: 'msg_' + Date.now(),
    conversationId: input.conversationId || `conv_${input.senderId}_${input.receiverId}_${input.projectId}`,
    senderId: input.senderId,
    receiverId: input.receiverId,
    content: input.content,
    projectId: input.projectId,
    timestamp: new Date().toISOString(),
    read: false,
    attachments: input.attachments || [],
  };

  if (isDatabaseEnabled()) {
    await dbQuery(
      `INSERT INTO app_messages (id, conversation_id, sender_id, receiver_id, project_id, content, read, attachments, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)`,
      [
        message.id,
        message.conversationId,
        message.senderId,
        message.receiverId,
        message.projectId || null,
        message.content,
        message.read,
        JSON.stringify(message.attachments),
        message.timestamp,
      ]
    );
  }

  const [senderUser, receiverUser] = await Promise.all([
    getAuthUserById(input.senderId),
    getAuthUserById(input.receiverId),
  ]);

  if (receiverUser?.email) {
    const senderName = senderUser
      ? (senderUser.businessName ?? `${senderUser.firstName} ${senderUser.lastName}`)
      : input.senderId;
    const receiverName = receiverUser.businessName ?? `${receiverUser.firstName} ${receiverUser.lastName}`;

    const emailResult = await sendNewMessageEmail(
      receiverUser.email,
      receiverName,
      senderName,
      input.content,
      message.conversationId
    );

    if (!emailResult.success) {
      console.error('Failed to send message notification email');
    }
  }

  publishMessageEvent({ type: 'message:new', userId: input.receiverId, message });
  publishMessageEvent({ type: 'message:new', userId: input.senderId, message });

  logPlatformEvent({
    type: 'message_sent',
    entityType: 'message',
    entityId: message.id,
    metadata: {
      conversationId: message.conversationId,
      senderId: input.senderId,
      receiverId: input.receiverId,
      projectId: input.projectId,
      attachmentCount: message.attachments.length,
    },
  });

  return message;
}

export async function markMessagesAsRead(messageIds: string[], userId: string): Promise<number> {
  if (isDatabaseEnabled()) {
    const rows = await dbQuery<{ id: string }>(
      `UPDATE app_messages SET read = true WHERE id = ANY($1::varchar[]) AND receiver_id = $2 RETURNING id`,
      [messageIds, userId]
    );
    return rows.length;
  }

  return messageIds.length;
}
