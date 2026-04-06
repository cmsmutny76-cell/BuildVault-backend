import { NextRequest, NextResponse } from 'next/server';
import { fetchBuildingCodes } from '../../../../lib/services/complianceService';
import { saveProjectDocument } from '../../../../lib/services/projectDocumentService';
import { getProjectById } from '../../../../lib/services/projectService';
import { buildBuildingCodesReportText } from '../../../../lib/services/reportBuilderService';

interface Location {
  city?: string;
  county?: string;
  state: string;
  zipCode?: string;
  projectType?: string;
}

async function generateBuildingCodesResponse(input: {
  location: Location;
  projectType?: string;
  projectId?: string;
  userId?: string;
}) {
  const { location, projectType, projectId, userId } = input;

  if (!location || !location.state) {
    return NextResponse.json(
      { error: 'Location with state is required' },
      { status: 400 },
    );
  }

  if (projectId) {
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
  }

  const complianceResult = await fetchBuildingCodes(location, projectType);
  const generatedAt = new Date().toISOString();
  const reportText = buildBuildingCodesReportText({
    location,
    projectType,
    agencies: complianceResult.agencies,
    codes: complianceResult.codes,
    disclaimer: complianceResult.disclaimer,
    generatedAt,
  });

  const report = {
    generatedAt,
    location,
    projectType,
    agencies: complianceResult.agencies,
    codes: complianceResult.codes,
    reportText,
    disclaimer: complianceResult.disclaimer,
    model: complianceResult.model,
    searchGrounded: (complianceResult as any).searchGrounded || false,
  };

  let savedDocument = null;
  if (projectId) {
    savedDocument = await saveProjectDocument({
      projectId,
      createdByUserId: userId,
      type: 'building-codes-report',
      title: `Building Codes Report - ${location.city || location.state}`,
      tags: ['building-codes', location.state, projectType || 'general'],
      data: {
        reportText,
      },
    });
  }

  return NextResponse.json({
    success: true,
    location,
    agencies: complianceResult.agencies,
    codes: complianceResult.codes,
    report,
    document: savedDocument,
    model: complianceResult.model,
    searchGrounded: (complianceResult as any).searchGrounded || false,
    disclaimer: complianceResult.disclaimer,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { location, projectType, projectId, userId } = await request.json() as {
      location: Location;
      projectType?: string;
      projectId?: string;
      userId?: string;
    };

    return await generateBuildingCodesResponse({
      location,
      projectType,
      projectId,
      userId,
    });
  } catch (error) {
    console.error('Building codes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch building codes' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get('state');
    const city = searchParams.get('city') || undefined;
    const county = searchParams.get('county') || undefined;
    const zipCode = searchParams.get('zipCode') || undefined;
    const projectType = searchParams.get('projectType') || undefined;
    const projectId = searchParams.get('projectId') || undefined;
    const userId = searchParams.get('userId') || undefined;

    if (!state) {
      return NextResponse.json(
        { error: 'State parameter is required' },
        { status: 400 },
      );
    }

    return await generateBuildingCodesResponse({
      location: { state, city, county, zipCode },
      projectType,
      projectId,
      userId,
    });
  } catch (error) {
    console.error('Building codes get error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch building codes' },
      { status: 500 },
    );
  }
}
