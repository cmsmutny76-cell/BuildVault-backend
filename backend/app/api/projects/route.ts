import { NextRequest, NextResponse } from 'next/server';
import { createProject, listProjects } from '../../../lib/services/projectService';

/**
 * GET /api/projects
 * List projects.
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      projects: await listProjects(),
    });
  } catch (error) {
    console.error('List projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create project.
 */
export async function POST(request: NextRequest) {
  try {
    const {
      ownerId,
      projectType,
      title,
      description,
      location,
    }: {
      ownerId: string;
      projectType: string;
      title: string;
      description?: string;
      location: { city: string; state: string; zipCode: string; street?: string; lat?: number; lng?: number };
    } = await request.json();

    if (!ownerId || !projectType || !title || !location?.city || !location?.state || !location?.zipCode) {
      return NextResponse.json(
        { success: false, error: 'ownerId, projectType, title, and location (city/state/zipCode) are required' },
        { status: 400 }
      );
    }

    const project = await createProject({
      ownerId,
      projectType,
      title,
      description,
      location,
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
