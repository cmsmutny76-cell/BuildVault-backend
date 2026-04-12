import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sendNewMessageEmail } from '../../../lib/email';
import { dbQuery, isDatabaseEnabled } from '../../../lib/db';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getAuthenticatedUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { userId?: string };
    return typeof decoded.userId === 'string' ? decoded.userId : null;
  } catch {
    // Dev fallback token support from auth/login route
    try {
      const parsed = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as {
        userId?: string;
        exp?: number;
      };

      if (typeof parsed.exp === 'number' && Date.now() > parsed.exp) {
        return null;
      }

      return typeof parsed.userId === 'string' ? parsed.userId : null;
    } catch {
      return null;
    }
  }
}

/**
 * GET /api/messages
 * Get messages for a user
 */
export async function GET(request: NextRequest) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const userId = requestedUserId || authenticatedUserId;
    const conversationId = searchParams.get('conversationId');

    if (requestedUserId && requestedUserId !== authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: user mismatch' },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!isDatabaseEnabled()) {
      return NextResponse.json(
        { success: false, error: 'Messaging database is not configured' },
        { status: 503 }
      );
    }

    // If conversationId provided, return messages for that conversation
    if (conversationId) {
      type MessageRow = {
        id: string;
        conversation_id: string;
        sender_id: string;
        recipient_id: string;
        content: string;
        created_at: Date;
        read: boolean;
      };

      const rows = await dbQuery<MessageRow>(
        `SELECT id, conversation_id, sender_id, recipient_id, content, created_at, read
         FROM messages
         WHERE conversation_id = $1
           AND (sender_id = $2 OR recipient_id = $2)
         ORDER BY created_at ASC`,
        [conversationId, userId]
      );

      const messages = rows.map((row) => ({
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        receiverId: row.recipient_id,
        content: row.content,
        timestamp: new Date(row.created_at).toISOString(),
        read: row.read,
        attachments: [],
      }));

      return NextResponse.json({ success: true, messages });
    }

    // Otherwise, return list of conversations
    type ConversationRow = {
      conversation_id: string;
      sender_id: string;
      recipient_id: string;
      content: string;
      created_at: Date;
      read: boolean;
    };

    const rows = await dbQuery<ConversationRow>(
      `SELECT conversation_id, sender_id, recipient_id, content, created_at, read
       FROM messages
       WHERE sender_id = $1 OR recipient_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const map = new Map<string, {
      id: string;
      participantId: string;
      lastMessage: { content: string; timestamp: string; senderId: string };
      unreadCount: number;
    }>();

    for (const row of rows) {
      const participantId = row.sender_id === userId ? row.recipient_id : row.sender_id;
      const existing = map.get(row.conversation_id);

      if (!existing) {
        map.set(row.conversation_id, {
          id: row.conversation_id,
          participantId,
          lastMessage: {
            content: row.content,
            timestamp: new Date(row.created_at).toISOString(),
            senderId: row.sender_id,
          },
          unreadCount: row.recipient_id === userId && !row.read ? 1 : 0,
        });
      } else if (row.recipient_id === userId && !row.read) {
        existing.unreadCount += 1;
      }
    }

    const participantIds = Array.from(new Set(Array.from(map.values()).map((c) => c.participantId)));

    type UserRow = { id: string; first_name: string | null; last_name: string | null; user_type: string | null };
    const users = participantIds.length
      ? await dbQuery<UserRow>(
          'SELECT id, first_name, last_name, user_type FROM users WHERE id = ANY($1::text[])',
          [participantIds]
        )
      : [];

    const userMap = new Map(users.map((u) => [u.id, u]));

    const conversations = Array.from(map.values()).map((conv) => {
      const participant = userMap.get(conv.participantId);
      return {
        id: conv.id,
        participants: [userId, conv.participantId],
        participantInfo: {
          id: conv.participantId,
          name: participant ? `${participant.first_name || ''} ${participant.last_name || ''}`.trim() || conv.participantId : conv.participantId,
          type: participant?.user_type || 'user',
          avatar: '👤',
        },
        projectId: null,
        projectTitle: 'General Conversation',
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount,
      };
    });

    return NextResponse.json({ success: true, conversations });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Send a new message
 */
export async function POST(request: NextRequest) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { conversationId, senderId, receiverId, content, projectId, attachments } = data;

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (senderId !== authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: sender mismatch' },
        { status: 403 }
      );
    }

    if (!isDatabaseEnabled()) {
      return NextResponse.json(
        { success: false, error: 'Messaging database is not configured' },
        { status: 503 }
      );
    }

    // Create and persist new message
    const messageId = `msg_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const computedConversationId = conversationId || `conv_${[senderId, receiverId].sort().join('_')}${projectId ? `_${projectId}` : ''}`;

    await dbQuery(
      `INSERT INTO messages (id, conversation_id, sender_id, recipient_id, content, read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [messageId, computedConversationId, senderId, receiverId, content, false]
    );

    const message = {
      id: messageId,
      conversationId: computedConversationId,
      senderId,
      receiverId,
      content,
      projectId,
      timestamp: new Date().toISOString(),
      read: false,
      attachments: attachments || [],
    };

    type UserEmailRow = { id: string; first_name: string | null; last_name: string | null; email: string };
    const users = await dbQuery<UserEmailRow>(
      'SELECT id, first_name, last_name, email FROM users WHERE id = ANY($1::text[])',
      [[senderId, receiverId]]
    );

    const sender = users.find((u) => u.id === senderId);
    const receiver = users.find((u) => u.id === receiverId);

    const senderName = sender ? `${sender.first_name || ''} ${sender.last_name || ''}`.trim() || senderId : senderId;
    const receiverName = receiver ? `${receiver.first_name || ''} ${receiver.last_name || ''}`.trim() || receiverId : receiverId;

    // Send email notification to receiver
    if (receiver?.email) {
      const emailResult = await sendNewMessageEmail(
        receiver.email,
        receiverName,
        senderName,
        content,
        message.conversationId
      );

      if (!emailResult.success) {
        console.error('Failed to send message notification email');
      }
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/messages
 * Mark messages as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { messageIds, userId } = data;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message IDs are required' },
        { status: 400 }
      );
    }

    if (!userId || userId !== authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: user mismatch' },
        { status: 403 }
      );
    }

    if (!isDatabaseEnabled()) {
      return NextResponse.json(
        { success: false, error: 'Messaging database is not configured' },
        { status: 503 }
      );
    }

    type UpdatedRow = { id: string };
    const updated = await dbQuery<UpdatedRow>(
      `UPDATE messages
       SET read = true
       WHERE id = ANY($1::text[])
         AND recipient_id = $2
       RETURNING id`,
      [messageIds, userId]
    );

    return NextResponse.json({
      success: true,
      markedCount: updated.length,
    });
  } catch (error) {
    console.error('Mark messages read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
