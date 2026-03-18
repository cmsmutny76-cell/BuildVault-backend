import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

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
  photoUrl: string;
  storageKey: string;
  uploadedAt: string;
  contentType: string;
  size: number;
  originalFileName: string;
}

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export async function uploadProjectPhoto(input: {
  file: File;
  projectId?: string;
  baseUrl: string;
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

  return {
    id: fileId,
    projectId: input.projectId,
    photoUrl: `${input.baseUrl}/${storageKey}`,
    storageKey,
    uploadedAt: new Date().toISOString(),
    contentType,
    size: input.file.size,
    originalFileName: input.file.name,
  };
}