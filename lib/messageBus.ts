import { EventEmitter } from 'events';
import { type MessageEventPayload } from './domain/message';
export type { MessageEventPayload } from './domain/message';

const bus = new EventEmitter();
bus.setMaxListeners(200);

export function publishMessageEvent(payload: MessageEventPayload): void {
  bus.emit('message-event', payload);
}

export function subscribeToMessageEvents(handler: (payload: MessageEventPayload) => void): () => void {
  bus.on('message-event', handler);
  return () => bus.off('message-event', handler);
}
