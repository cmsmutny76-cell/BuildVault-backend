import { NextRequest, NextResponse } from 'next/server';
import { getProjectById } from '../../../../lib/services/projectService';

/**
 * GET /api/projects/:projectId
 * Get single project details.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const project = await getProjectById(projectId);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve project' },
      { status: 500 }
    );
  }
}
