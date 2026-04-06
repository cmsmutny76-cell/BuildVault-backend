import { NextRequest, NextResponse } from 'next/server';
import {
  deleteProjectUpload,
  listProjectUploads,
  renameProjectUpload,
  uploadProjectPhoto,
} from '../../../../lib/services/photoUploadService';

type FormDataLike = {
  get?: (name: string) => unknown;
  getAll?: (name: string) => unknown[];
};

function isUploadFile(value: unknown): value is File {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as {
    name?: unknown;
    size?: unknown;
    type?: unknown;
    arrayBuffer?: unknown;
  };

  return (
    typeof candidate.name === 'string' &&
    typeof candidate.size === 'number' &&
    typeof candidate.type === 'string' &&
    typeof candidate.arrayBuffer === 'function'
  );
}

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId') || undefined;
    const assetType = request.nextUrl.searchParams.get('assetType') || undefined;
    const uploads = await listProjectUploads(projectId, assetType);

    return NextResponse.json({
      success: true,
      uploads,
    });
  } catch (error) {
    console.error('Upload listing error:', error);
    return NextResponse.json(
      { error: 'Failed to list uploads' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/photos/upload
 * Upload construction project photos
 */
export async function POST(request: NextRequest) {
  try {
    const formData = (await request.formData()) as unknown as FormDataLike;
    const getValue = (name: string) => (typeof formData.get === 'function' ? formData.get(name) : undefined);
    const getAllValues = (name: string) => (typeof formData.getAll === 'function' ? formData.getAll(name) : []);

    const projectIdValue = getValue('projectId');
    const assetTypeValue = getValue('assetType');
    const photoValue = getValue('photo');
    const fileValue = getValue('file');

    const projectId = typeof projectIdValue === 'string' ? projectIdValue : undefined;
    const assetType = typeof assetTypeValue === 'string' && assetTypeValue.trim() ? assetTypeValue : 'photo';
    const singleFile = isUploadFile(photoValue) ? photoValue : isUploadFile(fileValue) ? fileValue : null;
    const multiFiles = getAllValues('files').filter(isUploadFile);
    const files = multiFiles.length > 0 ? multiFiles : singleFile ? [singleFile] : [];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      );
    }

    const baseUrl = request.nextUrl.origin;
    const uploads = await Promise.all(
      files.map((file) =>
        uploadProjectPhoto({
          file,
          projectId,
          baseUrl,
          assetType,
        })
      )
    );
    const uploaded = uploads[0];

    return NextResponse.json({
      success: true,
      uploads,
      photo: {
        id: uploaded.id,
        projectId: uploaded.projectId,
        assetType: uploaded.assetType,
        photoUrl: uploaded.photoUrl,
        storageKey: uploaded.storageKey,
        uploadedAt: uploaded.uploadedAt,
        contentType: uploaded.contentType,
        originalFileName: uploaded.originalFileName,
      },
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, originalFileName } = await request.json();

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Upload id is required' }, { status: 400 });
    }

    if (!originalFileName || typeof originalFileName !== 'string') {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    const updated = await renameProjectUpload(id, originalFileName);
    if (!updated) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, upload: updated });
  } catch (error) {
    console.error('Upload rename error:', error);
    return NextResponse.json(
      { error: 'Failed to rename upload' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Upload id is required' }, { status: 400 });
    }

    const removed = await deleteProjectUpload(id);
    if (!removed) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, upload: removed });
  } catch (error) {
    console.error('Upload delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete upload' },
      { status: 500 }
    );
  }
}
