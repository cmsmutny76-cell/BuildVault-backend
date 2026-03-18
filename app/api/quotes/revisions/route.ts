import { NextRequest, NextResponse } from 'next/server';
import { createEstimateRevision, listEstimateRevisions } from '../../../../lib/services/revisionService';

/**
 * GET /api/quotes/revisions?estimateId=est_123
 * Return revision history for an estimate.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estimateId = searchParams.get('estimateId');

    if (!estimateId) {
      return NextResponse.json(
        { success: false, error: 'estimateId is required' },
        { status: 400 }
      );
    }

    const revisions = await listEstimateRevisions(estimateId);

    return NextResponse.json({
      success: true,
      estimateId,
      totalRevisions: revisions.length,
      revisions,
    });
  } catch (error) {
    console.error('Get estimate revisions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch estimate revisions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quotes/revisions
 * Add a new revision entry to an estimate.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { estimateId, updatedBy, reason, changes, projectId } = body;

    if (!estimateId || !updatedBy || !reason || !projectId || !Array.isArray(changes) || changes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'estimateId, projectId, updatedBy, reason, and non-empty changes are required' },
        { status: 400 }
      );
    }

    const result = await createEstimateRevision({
      estimateId,
      projectId,
      updatedBy,
      reason,
      changes,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      revision: result.revision,
      totalRevisions: result.totalRevisions,
    });
  } catch (error) {
    console.error('Create estimate revision error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create estimate revision' },
      { status: 500 }
    );
  }
}
