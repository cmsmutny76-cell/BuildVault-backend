import { NextRequest, NextResponse } from 'next/server';
import { createEstimate, listProjectEstimates } from '../../../lib/services/estimateService';
import { type EstimateLineItemInput } from '../../../lib/domain/estimate';
import { projectExists } from '../../../lib/services/projectService';

/**
 * GET /api/estimates?projectId=xxx
 * Get estimates for a project.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      estimates: await listProjectEstimates(projectId),
    });
  } catch (error) {
    console.error('Get estimates error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve estimates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/estimates
 * Create a contractor estimate for a project.
 */
export async function POST(request: NextRequest) {
  try {
    const {
      projectId,
      contractorId,
      projectTitle,
      lineItems,
      notes,
      validDays = 30,
    }: {
      projectId: string;
      contractorId: string;
      projectTitle: string;
      lineItems: EstimateLineItemInput[];
      notes?: string;
      validDays?: number;
    } = await request.json();

    if (!projectId || !contractorId || !projectTitle || !Array.isArray(lineItems)) {
      return NextResponse.json(
        { success: false, error: 'projectId, contractorId, projectTitle, and lineItems are required' },
        { status: 400 }
      );
    }

    if (!lineItems.length) {
      return NextResponse.json(
        { success: false, error: 'At least one line item is required' },
        { status: 400 }
      );
    }

    if (!(await projectExists(projectId))) {
      return NextResponse.json(
        { success: false, error: 'projectId does not exist' },
        { status: 404 }
      );
    }

    const estimate = await createEstimate({
      projectId,
      contractorId,
      projectTitle,
      lineItems,
      notes,
      validDays,
    });

    return NextResponse.json({
      success: true,
      estimate,
    });
  } catch (error) {
    console.error('Create estimate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create estimate' },
      { status: 500 }
    );
  }
}
