import { NextRequest, NextResponse } from 'next/server';
import { matchContractors, type MatchCriteria } from '../../../../lib/services/matchingService';
import { projectExists } from '../../../../lib/services/projectService';

/**
 * POST /api/ai/match-contractors
 * AI-powered contractor matching algorithm
 */
export async function POST(request: NextRequest) {
  try {
    const criteria: MatchCriteria = await request.json();

    const { projectId, projectType, budget, location, services, timeline, urgency, notify } = criteria;

    if (!projectId || !projectType || !budget || !location || !services || services.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required matching criteria' },
        { status: 400 }
      );
    }

    if (!(await projectExists(projectId))) {
      return NextResponse.json(
        { success: false, error: 'projectId does not exist' },
        { status: 404 }
      );
    }

    const { matches, notificationSent } = await matchContractors(criteria);

    return NextResponse.json({
      success: true,
      matches,
      matchCriteria: criteria,
      totalMatches: matches.length,
      notificationSent,
    });
  } catch (error) {
    console.error('Contractor matching error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to match contractors' },
      { status: 500 }
    );
  }
}
