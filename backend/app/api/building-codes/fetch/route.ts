import { NextRequest, NextResponse } from 'next/server';
import { fetchBuildingCodes, type BuildingCodesLocation } from '../../../../lib/services/complianceService';

/**
 * POST /api/building-codes/fetch
 * Fetch and parse building codes from county/state/city websites
 * Uses AI to extract relevant requirements for the project
 */
export async function POST(request: NextRequest) {
  try {
    const { location, projectType } = await request.json() as {
      location: BuildingCodesLocation;
      projectType?: string;
    };

    if (!location || !location.state) {
      return NextResponse.json(
        { error: 'Location with state is required' },
        { status: 400 }
      );
    }

    const result = await fetchBuildingCodes(location, projectType);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Building codes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch building codes' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/building-codes/fetch?state=CA&city=Los Angeles&projectType=residential
 * Alternative GET endpoint for fetching codes
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get('state');
  const city = searchParams.get('city');
  const county = searchParams.get('county');
  const projectType = searchParams.get('projectType');

  if (!state) {
    return NextResponse.json(
      { error: 'State parameter is required' },
      { status: 400 }
    );
  }

  // Reuse POST logic
  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({
        location: { state, city, county },
        projectType,
      }),
    })
  );
}
