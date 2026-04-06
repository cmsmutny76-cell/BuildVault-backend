import { NextRequest, NextResponse } from 'next/server';
import { sendNewMessageEmail } from '../../../lib/email';

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
      // TODO: Query database for messages in conversation
      const mockMessages = [
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
          content: 'Of course! I\'d be happy to answer any questions you have.',
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

      return NextResponse.json({
        success: true,
        messages: mockMessages,
      });
    }

    // Otherwise, return list of conversations
    // TODO: Query database for conversations
    const mockConversations = [
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
          content: 'I\'ve sent you the updated timeline',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          senderId: 'user_3',
        },
        unreadCount: 0,
      },
    ];

    return NextResponse.json({
      success: true,
      conversations: mockConversations,
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

    // Create new message
    const message = {
      id: 'msg_' + Date.now(),
      conversationId: conversationId || `conv_${senderId}_${receiverId}_${projectId}`,
      senderId,
      receiverId,
      content,
      projectId,
      timestamp: new Date().toISOString(),
      read: false,
      attachments: attachments || [],
    };

    // TODO: Save to database
    // TODO: Use WebSocket or Server-Sent Events for real-time delivery
    
    // Mock user data - Replace with actual database fetch
    const mockSender = {
      name: 'John Doe',
    };
    
    const mockReceiver = {
      email: 'recipient@example.com',
      name: 'Jane Smith',
    };
    
    const mockProject = {
      title: 'Kitchen Remodel',
    };

    // Send email notification to receiver
    const emailResult = await sendNewMessageEmail(
      mockReceiver.email,
      mockReceiver.name,
      mockSender.name,
      content,
      message.conversationId
    );
    
    if (!emailResult.success) {
      console.error('Failed to send message notification email');
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
    const data = await request.json();
    const { messageIds, userId } = data;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message IDs are required' },
        { status: 400 }
      );
    }

    // TODO: Update messages in database to mark as read
    // TODO: Only mark messages where receiver is userId

    return NextResponse.json({
      success: true,
      markedCount: messageIds.length,
    });
  } catch (error) {
    console.error('Mark messages read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
