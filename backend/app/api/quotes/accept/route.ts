import { NextRequest, NextResponse } from 'next/server';
import { sendEstimateAcceptedEmail } from '../../../../lib/email';

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

    // TODO: Fetch estimate from database
    // TODO: Verify estimate belongs to project
    // TODO: Check estimate is still valid
    // TODO: Create project agreement
    // TODO: Update project status to 'in-progress'
    // TODO: Reject all other pending estimates for this project

    // Mock estimate data - Replace with actual database fetch
    const mockEstimate = {
      contractor: {
        email: 'contractor@example.com',
        name: 'ABC Construction',
      },
      homeowner: {
        name: 'John Doe',
      },
      project: {
        title: 'Kitchen Remodel',
      },
      total: 25000,
    };

    const agreement = {
      id: 'agr_' + Date.now(),
      estimateId,
      projectId,
      userId,
      status: 'active',
      acceptedAt: new Date().toISOString(),
      startDate: new Date().toISOString(),
      expectedCompletionDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Send notification email to contractor
    const emailResult = await sendEstimateAcceptedEmail(
      mockEstimate.contractor.email,
      mockEstimate.contractor.name,
      mockEstimate.homeowner.name,
      mockEstimate.project.title,
      mockEstimate.total
    );
    
    if (!emailResult.success) {
      console.error('Failed to send acceptance email to contractor');
    }

    return NextResponse.json({
      success: true,
      agreement,
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
