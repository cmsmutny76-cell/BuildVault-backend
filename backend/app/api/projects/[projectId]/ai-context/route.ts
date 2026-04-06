import { NextResponse } from 'next/server';
import { getProjectById } from '../../../../../lib/services/projectService';
import { listProjectDocuments } from '../../../../../lib/services/projectDocumentService';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const documents = await listProjectDocuments(projectId);

    return NextResponse.json({
      success: true,
      project,
      aiContext: {
        projectSummary: {
          id: project.id,
          title: project.title,
          type: project.projectType,
          location: project.location,
        },
        historicalDocuments: documents.slice(0, 50),
      },
    });
  } catch (error) {
    console.error('AI context error:', error);
    return NextResponse.json({ success: false, error: 'Failed to build AI context' }, { status: 500 });
  }
}
