import { NextRequest, NextResponse } from 'next/server';
import {
  listConversationsForUser,
  listMessagesForConversation,
  markMessagesAsRead,
  sendMessage,
} from '../../../lib/services/messageService';

/**
 * GET /api/messages
 * Get messages for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // If conversationId provided, return messages for that conversation
    if (conversationId) {
      return NextResponse.json({
        success: true,
        messages: await listMessagesForConversation(conversationId),
      });
    }

    return NextResponse.json({
      success: true,
      conversations: await listConversationsForUser(userId),
    });
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
    const data = await request.json();
    const { conversationId, senderId, receiverId, content, projectId, attachments } = data;

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const message = await sendMessage({
      conversationId,
      senderId,
      receiverId,
      content,
      projectId,
      attachments,
    });

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
    const data = await request.json();
    const { messageIds, userId } = data;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0 || !userId) {
      return NextResponse.json(
        { success: false, error: 'Message IDs and userId are required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      markedCount: await markMessagesAsRead(messageIds, userId),
    });
  } catch (error) {
    console.error('Mark messages read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
