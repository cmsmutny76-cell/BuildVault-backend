import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/photos/upload
 * Upload construction project photos
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      );
    }

    // TODO: Upload to S3
    // const s3Key = await uploadToS3(file);

    // Mock response for MVP
    const photoData = {
      id: Date.now(),
      projectId,
      photoUrl: 'https://placeholder.com/photo.jpg',
      s3Key: 'mock-s3-key',
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      photo: photoData,
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
