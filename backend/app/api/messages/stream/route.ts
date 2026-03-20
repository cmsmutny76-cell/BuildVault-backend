import { NextRequest } from 'next/server';
import { MessageEventPayload, subscribeToMessageEvents } from '../../../../lib/messageBus';

export const runtime = 'nodejs';

/**
 * GET /api/messages/stream?userId=xxx
 * Server-Sent Events stream for near real-time message updates.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response('userId is required', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (payload: MessageEventPayload) => {
        if (payload.userId !== userId) {
          return;
        }

        controller.enqueue(encoder.encode(`event: message\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      // Initial handshake event
      controller.enqueue(
        encoder.encode(`event: ready\ndata: ${JSON.stringify({ userId, connectedAt: new Date().toISOString() })}\n\n`)
      );

      const unsubscribe = subscribeToMessageEvents(send);

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
