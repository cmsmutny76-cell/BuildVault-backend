import { NextRequest, NextResponse } from 'next/server';
import { acceptEstimate } from '../../../../lib/services/estimateAcceptanceService';

interface AcceptEstimateRequest {
  estimateId: string;
  userId: string;
  projectId: string;
}

/**
 * POST /api/quotes/accept
 * Accept an estimate and create a project agreement
 */
export async function POST(request: NextRequest) {
  try {
    const data: AcceptEstimateRequest = await request.json();
    const { estimateId, userId, projectId } = data;

    if (!estimateId || !userId || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const result = await acceptEstimate({ estimateId, userId, projectId });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      agreement: result.agreement,
      message: 'Estimate accepted successfully',
    });
  } catch (error) {
    console.error('Accept estimate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to accept estimate' },
      { status: 500 }
    );
  }
}
