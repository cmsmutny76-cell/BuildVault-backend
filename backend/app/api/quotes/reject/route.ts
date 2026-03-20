import { NextRequest, NextResponse } from 'next/server';
import { rejectEstimate } from '../../../../lib/services/estimateRejectionService';

interface RejectEstimateRequest {
  estimateId: string;
  userId: string;
  projectId: string;
}

/**
 * POST /api/quotes/reject
 * Reject an estimate
 */
export async function POST(request: NextRequest) {
  try {
    const data: RejectEstimateRequest = await request.json();
    const { estimateId, userId, projectId } = data;

    if (!estimateId || !userId || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const result = await rejectEstimate({ estimateId, userId, projectId });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      rejection: result.rejection,
      message: 'Estimate rejected successfully',
    });
  } catch (error) {
    console.error('Reject estimate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject estimate' },
      { status: 500 }
    );
  }
}
