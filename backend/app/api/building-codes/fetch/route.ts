import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface Location {
  city?: string;
  county?: string;
  state: string;
  zipCode?: string;
  projectType?: string;
}

/**
 * POST /api/building-codes/fetch
 * Fetch and parse building codes from county/state/city websites
 * Uses AI to extract relevant requirements for the project
 */
export async function POST(request: NextRequest) {
  try {
    const { location, projectType } = await request.json() as {
      location: Location;
      projectType?: string;
    };

    if (!location || !location.state) {
      return NextResponse.json(
        { error: 'Location with state is required' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    // For MVP, we'll use AI to generate code requirements
    // In production, you'd scrape actual city/county websites
    const codePrompt = `Generate typical building code requirements for a ${projectType || 'residential construction'} project in ${location.city || location.county || ''}, ${location.state}.

Include requirements for:
1. Structural (framing, foundation, load-bearing requirements)
2. Electrical (outlet spacing, GFCI requirements, circuit breakers)
3. Plumbing (if applicable)
4. HVAC (if applicable)  
5. Fire safety (smoke detectors, fire-rated materials)
6. Insulation and energy efficiency
7. Special hardware or fasteners required by code
8. Permits required

Focus on ADDITIONAL HARDWARE that must be purchased to meet code (e.g., hurricane ties, seismic anchors, GFCI outlets, specific connectors, etc.).

Provide response in JSON format with categories and specific requirements.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a building code expert familiar with IBC, IRC, and local building codes across the United States.',
          },
          {
            role: 'user',
            content: codePrompt,
          },
        ],
        max_tokens: 1500,
      });

      const codesText = response.choices[0]?.message?.content || '';
      
      let codesData;
      try {
        codesData = JSON.parse(codesText);
      } catch {
        codesData = {
          rawData: codesText,
          categories: [],
        };
      }

      return NextResponse.json({
        success: true,
        location,
        codes: codesData,
        model: 'gpt-4o',
        disclaimer: 'AI-generated code requirements. Always verify with local building department.',
      });
    } catch (aiError: any) {
      console.error('OpenAI API error:', aiError);
      
      // Return mock building codes for testing
      return NextResponse.json({
        success: true,
        location,
        codes: {
          structural: {
            requirements: [
              'Hurricane ties required for all roof-to-wall connections',
              'Foundation anchor bolts every 6 feet, max 12 inches from corners',
              'Shear wall hold-downs for seismic zones',
              'Simpson Strong-Tie connectors or equivalent',
            ],
            hardware: [
              { name: 'Hurricane Ties H2.5', quantity: 'per rafter', code: 'IRC R802.11' },
              { name: 'Foundation Anchor Bolts 1/2"', quantity: 'every 6ft', code: 'IRC R403.1.6' },
              { name: 'Joist Hangers', quantity: 'per joist', code: 'IRC R502.6' },
            ],
          },
          electrical: {
            requirements: [
              'GFCI protection within 6 feet of water sources',
              'AFCI protection in living areas, bedrooms',
              'Tamper-resistant outlets in all areas',
              'Weatherproof covers for exterior outlets',
            ],
            hardware: [
              { name: 'GFCI Outlets 15A', quantity: 'kitchens/bathrooms', code: 'NEC 210.8' },
              { name: 'AFCI Circuit Breakers', quantity: 'per bedroom circuit', code: 'NEC 210.12' },
              { name: 'Tamper-Resistant Outlets', quantity: 'all outlets', code: 'NEC 406.12' },
            ],
          },
          fireAndSafety: {
            requirements: [
              'Smoke detectors in each bedroom and hallway',
              'Carbon monoxide detectors within 10 feet of bedrooms',
              'Fire-rated drywall in garage',
              'Self-closing door to garage',
            ],
            hardware: [
              { name: 'Smoke Detectors (hardwired)', quantity: 'per bedroom + hallways', code: 'IRC R314' },
              { name: 'CO Detectors', quantity: 'per floor', code: 'IRC R315' },
              { name: '5/8" Type X Drywall', quantity: 'garage walls/ceiling', code: 'IRC R302.6' },
            ],
          },
          insulation: {
            requirements: [
              `R-${getInsulationValue(location.state, 'wall')} for exterior walls`,
              `R-${getInsulationValue(location.state, 'ceiling')} for ceilings`,
              'Vapor barriers in crawl spaces',
              'Weather stripping on all exterior doors',
            ],
            hardware: [
              { name: 'Insulation Baffles', quantity: 'per rafter bay', code: 'IRC R806.3' },
              { name: 'Vapor Barrier 6-mil poly', quantity: 'crawl space area', code: 'IRC R408.2' },
            ],
          },
          permits: {
            required: [
              'Building permit (structural changes)',
              'Electrical permit (new circuits/outlets)',
              'Plumbing permit (if applicable)',
              'Mechanical permit (HVAC work)',
            ],
            estimatedCost: '$200 - $800',
            applicationUrl: `https://www.${location.city?.toLowerCase().replace(' ', '')}.gov/permits`,
          },
        },
        model: 'mock-data',
        disclaimer: 'Mock building codes - configure OPENAI_API_KEY and implement code scraping for real data',
      });
    }
  } catch (error) {
    console.error('Building codes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch building codes' },
      { status: 500 }
    );
  }
}

// Helper function to determine insulation R-value by state
function getInsulationValue(state: string, type: 'wall' | 'ceiling'): number {
  const coldStates = ['AK', 'MN', 'ND', 'SD', 'MT', 'WI', 'MI', 'ME', 'VT', 'NH'];
  const warmStates = ['FL', 'HI', 'AZ', 'TX', 'LA', 'GA'];
  
  if (type === 'wall') {
    if (coldStates.includes(state)) return 21;
    if (warmStates.includes(state)) return 13;
    return 15; // Default moderate climate
  } else {
    if (coldStates.includes(state)) return 49;
    if (warmStates.includes(state)) return 30;
    return 38; // Default moderate climate
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
