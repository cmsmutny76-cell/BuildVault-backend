import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { dbQuery, isDatabaseEnabled } from '../db';

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

export interface UploadedPhotoRecord {
  id: string;
  projectId?: string;
  assetType: string;
  photoUrl: string;
  storageKey: string;
  uploadedAt: string;
  contentType: string;
  size: number;
  originalFileName: string;
}

type UploadRow = {
  id: string;
  project_id: string | null;
  asset_type: string;
  photo_url: string;
  storage_key: string;
  uploaded_at: Date;
  content_type: string;
  size: number;
  original_file_name: string;
};

const uploadStore = new Map<string, UploadedPhotoRecord[]>();
let uploadsTableEnsured = false;

async function ensureUploadsTable() {
  if (!isDatabaseEnabled() || uploadsTableEnsured) {
    return;
  }

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS app_project_uploads (
      id TEXT PRIMARY KEY,
      project_id TEXT NULL,
      asset_type TEXT NOT NULL DEFAULT 'photo',
      photo_url TEXT NOT NULL,
      storage_key TEXT NOT NULL,
      uploaded_at TIMESTAMPTZ NOT NULL,
      content_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      original_file_name TEXT NOT NULL
    )`
  );

  await dbQuery(`ALTER TABLE app_project_uploads ADD COLUMN IF NOT EXISTS asset_type TEXT NOT NULL DEFAULT 'photo'`);

  uploadsTableEnsured = true;
}

function mapUploadRow(row: UploadRow): UploadedPhotoRecord {
  return {
    id: row.id,
    projectId: row.project_id || undefined,
    assetType: row.asset_type,
    photoUrl: row.photo_url,
    storageKey: row.storage_key,
    uploadedAt: new Date(row.uploaded_at).toISOString(),
    contentType: row.content_type,
    size: row.size,
    originalFileName: row.original_file_name,
  };
}

async function saveUploadedRecord(record: UploadedPhotoRecord) {
  if (!isDatabaseEnabled()) {
    const key = record.projectId || 'unassigned';
    const existing = uploadStore.get(key) || [];
    uploadStore.set(key, [record, ...existing]);
    return;
  }

  try {
    await ensureUploadsTable();
    await dbQuery(
      `INSERT INTO app_project_uploads (id, project_id, asset_type, photo_url, storage_key, uploaded_at, content_type, size, original_file_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        record.id,
        record.projectId || null,
        record.assetType,
        record.photoUrl,
        record.storageKey,
        record.uploadedAt,
        record.contentType,
        record.size,
        record.originalFileName,
      ]
    );
  } catch {
    const key = record.projectId || 'unassigned';
    const existing = uploadStore.get(key) || [];
    uploadStore.set(key, [record, ...existing]);
  }
}

async function findUploadById(id: string): Promise<UploadedPhotoRecord | null> {
  if (!isDatabaseEnabled()) {
    const records = Array.from(uploadStore.values()).flat();
    return records.find((record) => record.id === id) || null;
  }

  try {
    await ensureUploadsTable();
    const rows = await dbQuery<UploadRow>('SELECT * FROM app_project_uploads WHERE id = $1 LIMIT 1', [id]);
    return rows.length > 0 ? mapUploadRow(rows[0]) : null;
  } catch {
    const records = Array.from(uploadStore.values()).flat();
    return records.find((record) => record.id === id) || null;
  }
}

function updateInMemoryRecord(id: string, update: (record: UploadedPhotoRecord) => UploadedPhotoRecord | null): UploadedPhotoRecord | null {
  for (const [key, records] of uploadStore.entries()) {
    const index = records.findIndex((record) => record.id === id);
    if (index === -1) {
      continue;
    }

    const existing = records[index];
    const next = update(existing);

    if (!next) {
      const updatedRecords = [...records.slice(0, index), ...records.slice(index + 1)];
      uploadStore.set(key, updatedRecords);
      return existing;
    }

    const updatedRecords = [...records];
    updatedRecords[index] = next;
    uploadStore.set(key, updatedRecords);
    return next;
  }

  return null;
}

function resolveStorageAbsolutePath(storageKey: string): string {
  return path.join(process.cwd(), 'public', ...storageKey.split('/'));
}

export async function listProjectUploads(projectId?: string, assetType?: string): Promise<UploadedPhotoRecord[]> {
  if (!isDatabaseEnabled()) {
    const records = projectId ? uploadStore.get(projectId) || [] : Array.from(uploadStore.values()).flat();
    return assetType ? records.filter((record) => record.assetType === assetType) : records;
  }

  try {
    await ensureUploadsTable();
    const rows = projectId && assetType
      ? await dbQuery<UploadRow>(
          'SELECT * FROM app_project_uploads WHERE project_id = $1 AND asset_type = $2 ORDER BY uploaded_at DESC',
          [projectId, assetType]
        )
      : projectId
        ? await dbQuery<UploadRow>(
            'SELECT * FROM app_project_uploads WHERE project_id = $1 ORDER BY uploaded_at DESC',
            [projectId]
          )
        : assetType
          ? await dbQuery<UploadRow>('SELECT * FROM app_project_uploads WHERE asset_type = $1 ORDER BY uploaded_at DESC', [assetType])
          : await dbQuery<UploadRow>('SELECT * FROM app_project_uploads ORDER BY uploaded_at DESC');
    return rows.map(mapUploadRow);
  } catch {
    const records = projectId ? uploadStore.get(projectId) || [] : Array.from(uploadStore.values()).flat();
    return assetType ? records.filter((record) => record.assetType === assetType) : records;
  }
}

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export async function uploadProjectPhoto(input: {
  file: File;
  projectId?: string;
  baseUrl: string;
  assetType?: string;
}): Promise<UploadedPhotoRecord> {
  if (!input.file.size) {
    throw new Error('Uploaded file is empty');
  }

  if (input.file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('Uploaded file exceeds the 10MB size limit');
  }

  const contentType = input.file.type || 'application/octet-stream';
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    throw new Error('Unsupported file type');
  }

  const projectSegment = sanitizePathSegment(input.projectId || 'unassigned');
  const fileId = randomUUID();
  const fileExtension = EXTENSION_BY_MIME_TYPE[contentType] || path.extname(input.file.name) || '.bin';
  const fileName = `${fileId}${fileExtension}`;
  const storageKey = path.posix.join('uploads', 'projects', projectSegment, fileName);
  const absoluteFilePath = path.join(process.cwd(), 'public', ...storageKey.split('/'));

  await mkdir(path.dirname(absoluteFilePath), { recursive: true });

  const fileBuffer = Buffer.from(await input.file.arrayBuffer());
  await writeFile(absoluteFilePath, fileBuffer);

  const record = {
    id: fileId,
    projectId: input.projectId,
    assetType: input.assetType || 'photo',
    photoUrl: `${input.baseUrl}/${storageKey}`,
    storageKey,
    uploadedAt: new Date().toISOString(),
    contentType,
    size: input.file.size,
    originalFileName: input.file.name,
  };

  await saveUploadedRecord(record);

  return record;
}

export async function renameProjectUpload(id: string, originalFileName: string): Promise<UploadedPhotoRecord | null> {
  const nextName = originalFileName.trim();
  if (!nextName) {
    throw new Error('File name is required');
  }

  if (!isDatabaseEnabled()) {
    return updateInMemoryRecord(id, (record) => ({ ...record, originalFileName: nextName }));
  }

  try {
    await ensureUploadsTable();
    const rows = await dbQuery<UploadRow>(
      `UPDATE app_project_uploads
       SET original_file_name = $2
       WHERE id = $1
       RETURNING *`,
      [id, nextName]
    );

    if (rows.length > 0) {
      return mapUploadRow(rows[0]);
    }

    return null;
  } catch {
    return updateInMemoryRecord(id, (record) => ({ ...record, originalFileName: nextName }));
  }
}

export async function deleteProjectUpload(id: string): Promise<UploadedPhotoRecord | null> {
  const existing = await findUploadById(id);
  if (!existing) {
    return null;
  }

  let removed: UploadedPhotoRecord | null = null;

  if (!isDatabaseEnabled()) {
    removed = updateInMemoryRecord(id, () => null);
  } else {
    try {
      await ensureUploadsTable();
      const rows = await dbQuery<UploadRow>('DELETE FROM app_project_uploads WHERE id = $1 RETURNING *', [id]);
      removed = rows.length > 0 ? mapUploadRow(rows[0]) : null;
    } catch {
      removed = updateInMemoryRecord(id, () => null);
    }
  }

  const removedRecord = removed || existing;
  try {
    await unlink(resolveStorageAbsolutePath(removedRecord.storageKey));
  } catch {
  }

  return removedRecord;
}