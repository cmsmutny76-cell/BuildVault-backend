import { dbQuery, isDatabaseEnabled } from '../db';
import { logPlatformEvent } from '../eventLogger';

export type ProjectDocumentType =
  | 'building-codes-report'
  | 'photo-analysis-report'
  | 'blueprint-analysis-report'
  | 'materials-quote-report'
  | 'compliance-summary-report';

export interface ProjectDocumentRecord {
  id: string;
  projectId: string;
  createdByUserId?: string;
  type: ProjectDocumentType;
  title: string;
  format: 'json';
  data: Record<string, unknown>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectDocumentRow {
  id: string;
  project_id: string;
  created_by_user_id: string | null;
  type: ProjectDocumentType;
  title: string;
  format: 'json';
  data: Record<string, unknown>;
  tags: string[] | null;
  created_at: Date;
  updated_at: Date;
}

const fallbackStore = new Map<string, ProjectDocumentRecord[]>();
let tableEnsured = false;

async function ensureProjectDocumentsTable() {
  if (!isDatabaseEnabled() || tableEnsured) {
    return;
  }

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS app_project_documents (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      created_by_user_id TEXT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      format TEXT NOT NULL,
      data JSONB NOT NULL,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )`
  );

  tableEnsured = true;
}

function mapRow(row: ProjectDocumentRow): ProjectDocumentRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    createdByUserId: row.created_by_user_id || undefined,
    type: row.type,
    title: row.title,
    format: row.format,
    data: row.data,
    tags: row.tags || [],
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function listProjectDocuments(projectId: string, type?: ProjectDocumentType): Promise<ProjectDocumentRecord[]> {
  if (!isDatabaseEnabled()) {
    const docs = fallbackStore.get(projectId) || [];
    return type ? docs.filter((doc) => doc.type === type) : docs;
  }

  try {
    await ensureProjectDocumentsTable();
    const rows = type
      ? await dbQuery<ProjectDocumentRow>(
          'SELECT * FROM app_project_documents WHERE project_id = $1 AND type = $2 ORDER BY created_at DESC',
          [projectId, type]
        )
      : await dbQuery<ProjectDocumentRow>(
          'SELECT * FROM app_project_documents WHERE project_id = $1 ORDER BY created_at DESC',
          [projectId]
        );

    return rows.map(mapRow);
  } catch {
    const docs = fallbackStore.get(projectId) || [];
    return type ? docs.filter((doc) => doc.type === type) : docs;
  }
}

export async function getProjectDocumentById(documentId: string): Promise<ProjectDocumentRecord | null> {
  if (!isDatabaseEnabled()) {
    for (const docs of fallbackStore.values()) {
      const match = docs.find((doc) => doc.id === documentId);
      if (match) return match;
    }
    return null;
  }

  try {
    await ensureProjectDocumentsTable();
    const rows = await dbQuery<ProjectDocumentRow>('SELECT * FROM app_project_documents WHERE id = $1 LIMIT 1', [documentId]);
    return rows[0] ? mapRow(rows[0]) : null;
  } catch {
    for (const docs of fallbackStore.values()) {
      const match = docs.find((doc) => doc.id === documentId);
      if (match) return match;
    }
    return null;
  }
}

export async function saveProjectDocument(input: {
  projectId: string;
  createdByUserId?: string;
  type: ProjectDocumentType;
  title: string;
  data: Record<string, unknown>;
  tags?: string[];
}): Promise<ProjectDocumentRecord> {
  const now = new Date().toISOString();
  const record: ProjectDocumentRecord = {
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    projectId: input.projectId,
    createdByUserId: input.createdByUserId,
    type: input.type,
    title: input.title,
    format: 'json',
    data: input.data,
    tags: input.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  if (!isDatabaseEnabled()) {
    const existing = fallbackStore.get(record.projectId) || [];
    fallbackStore.set(record.projectId, [record, ...existing]);
  } else {
    try {
      await ensureProjectDocumentsTable();
      await dbQuery(
        `INSERT INTO app_project_documents (id, project_id, created_by_user_id, type, title, format, data, tags, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10)`,
        [
          record.id,
          record.projectId,
          record.createdByUserId || null,
          record.type,
          record.title,
          record.format,
          JSON.stringify(record.data),
          JSON.stringify(record.tags),
          record.createdAt,
          record.updatedAt,
        ]
      );
    } catch {
      const existing = fallbackStore.get(record.projectId) || [];
      fallbackStore.set(record.projectId, [record, ...existing]);
    }
  }

  logPlatformEvent({
    type: 'building_codes_generated',
    entityType: 'document',
    entityId: record.projectId,
    metadata: {
      documentId: record.id,
      documentType: record.type,
      title: record.title,
      tags: record.tags,
    },
  });

  return record;
}
