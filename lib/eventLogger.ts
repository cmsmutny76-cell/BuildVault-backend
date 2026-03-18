import { dbQuery, isDatabaseEnabled } from './db';

export type PlatformEventType =
  | 'project_created'
  | 'estimate_created'
  | 'material_quote_generated'
  | 'revision_added'
  | 'estimate_accepted'
  | 'estimate_rejected'
  | 'contractor_matched'
  | 'contractor_availability_updated'
  | 'message_sent'
  | 'building_codes_generated'
  | 'user_profile_updated'
  | 'estimate_pdf_generated'
  | 'estimate_pdf_emailed';

export interface PlatformEvent {
  id: string;
  type: PlatformEventType;
  entityType: 'project' | 'estimate' | 'revision' | 'message' | 'matching' | 'compliance' | 'user' | 'document';
  entityId: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

const platformEventStore: PlatformEvent[] = [];

export function logPlatformEvent(input: Omit<PlatformEvent, 'id' | 'occurredAt'>): PlatformEvent {
  const event: PlatformEvent = {
    id: `evt_${Date.now()}_${platformEventStore.length + 1}`,
    occurredAt: new Date().toISOString(),
    ...input,
  };

  platformEventStore.unshift(event);
  console.log('[event]', JSON.stringify(event));

  if (isDatabaseEnabled()) {
    void dbQuery(
      `INSERT INTO platform_events (id, type, entity_type, entity_id, occurred_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [event.id, event.type, event.entityType, event.entityId, event.occurredAt, JSON.stringify(event.metadata || {})]
    ).catch((error) => {
      console.error('Failed to persist platform event:', error);
    });
  }

  return event;
}

export async function listPlatformEvents(limit = 100): Promise<PlatformEvent[]> {
  if (!isDatabaseEnabled()) {
    return platformEventStore.slice(0, limit);
  }

  const rows = await dbQuery<{
    id: string;
    type: PlatformEventType;
    entity_type: PlatformEvent['entityType'];
    entity_id: string;
    occurred_at: Date;
    metadata: Record<string, unknown> | null;
  }>(
    'SELECT id, type, entity_type, entity_id, occurred_at, metadata FROM platform_events ORDER BY occurred_at DESC LIMIT $1',
    [limit]
  );

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    occurredAt: new Date(row.occurred_at).toISOString(),
    metadata: row.metadata || undefined,
  }));
}

export async function countPlatformEvents(): Promise<number> {
  if (!isDatabaseEnabled()) {
    return platformEventStore.length;
  }

  const rows = await dbQuery<{ count: string }>('SELECT COUNT(*)::text AS count FROM platform_events');
  return Number(rows[0]?.count || 0);
}
