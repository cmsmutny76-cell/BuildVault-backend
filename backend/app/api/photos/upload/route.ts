import { NextRequest, NextResponse } from 'next/server';
import { uploadProjectPhoto } from '../../../../lib/services/photoUploadService';

interface FormDataWithGet {
  get(name: string): FormDataEntryValue | null;
}

/**
 * POST /api/photos/upload
 * Upload construction project photos
 */
export async function POST(request: NextRequest) {
  try {
    const formData = (await request.formData()) as unknown as FormDataWithGet;
    const file = formData.get('photo') as File;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const photoData = await uploadProjectPhoto({
      file,
      projectId: typeof projectId === 'string' && projectId ? projectId : undefined,
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      photo: photoData,
    });
  } catch (error) {
    console.error('Photo upload error:', error);

    if (error instanceof Error) {
      const isValidationError =
        error.message === 'Uploaded file is empty' ||
        error.message === 'Uploaded file exceeds the 10MB size limit' ||
        error.message === 'Unsupported file type';

      if (isValidationError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
