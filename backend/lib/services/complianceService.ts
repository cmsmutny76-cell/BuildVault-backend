import OpenAI from 'openai';
import { logPlatformEvent } from '../eventLogger';

async function searchBuildingCodes(location: BuildingCodesLocation, projectType?: string): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) return '';

  const query = [
    location.city,
    location.county,
    location.state,
    projectType || 'residential construction',
    'building codes requirements',
    new Date().getFullYear(),
  ]
    .filter(Boolean)
    .join(' ');

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query,
        search_depth: 'basic',
        include_domains: ['up.codes', 'iccsafe.org', 'hud.gov', 'osha.gov', 'epa.gov', 'gov'],
        max_results: 5,
      }),
    });

    if (!response.ok) {
      console.warn('Tavily search failed:', response.status);
      return '';
    }

    const data = (await response.json()) as {
      results?: Array<{ title?: string; url?: string; content?: string }>;
    };

    if (!data.results?.length) return '';

    return data.results
      .map(
        (r, i) =>
          `[Source ${i + 1}] ${r.title || 'No title'}\nURL: ${r.url || ''}\n${r.content || ''}`,
      )
      .join('\n\n---\n\n');
  } catch (err) {
    console.warn('Tavily search error:', err);
    return '';
  }
}

export interface BuildingCodesLocation {
  city?: string;
  county?: string;
  state: string;
  zipCode?: string;
  projectType?: string;
}

function buildAgencyDirectory(location: BuildingCodesLocation) {
  return {
    city: [
      {
        name: `${location.city || 'City'} Building Department`,
        scope: 'city',
        url: `https://www.google.com/search?q=${encodeURIComponent(`${location.city || ''} ${location.state} building department`)}`,
      },
      {
        name: `${location.city || 'City'} Planning & Zoning`,
        scope: 'city',
        url: `https://www.google.com/search?q=${encodeURIComponent(`${location.city || ''} ${location.state} planning and zoning`)}`,
      },
    ],
    county: [
      {
        name: `${location.county || location.city || 'County'} Code Enforcement`,
        scope: 'county',
        url: `https://www.google.com/search?q=${encodeURIComponent(`${location.county || location.city || ''} ${location.state} code enforcement`)}`,
      },
    ],
    state: [
      {
        name: `${location.state} State Building Code Agency`,
        scope: 'state',
        url: `https://www.google.com/search?q=${encodeURIComponent(`${location.state} building code office`)}`,
      },
    ],
    federal: [
      {
        name: 'U.S. Department of Housing and Urban Development (HUD)',
        scope: 'federal',
        url: 'https://www.hud.gov/',
      },
      {
        name: 'Occupational Safety and Health Administration (OSHA)',
        scope: 'federal',
        url: 'https://www.osha.gov/',
      },
      {
        name: 'Environmental Protection Agency (EPA)',
        scope: 'federal',
        url: 'https://www.epa.gov/',
      },
    ],
  };
}

export async function fetchBuildingCodes(location: BuildingCodesLocation, projectType?: string) {
    const agencies = buildAgencyDirectory(location);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });

  // Retrieve real-time building code information from the web before asking GPT
  const searchContext = await searchBuildingCodes(location, projectType);

  const systemMessage = searchContext
    ? `You are a building code expert familiar with IBC, IRC, and local building codes across the United States.\n\nThe following real-time search results have been retrieved for this jurisdiction. Use them as your primary source of truth — cite code sections and requirements found in these pages where possible:\n\n${searchContext}`
    : 'You are a building code expert familiar with IBC, IRC, and local building codes across the United States.';

  const codePrompt = `Generate specific building code requirements for a ${projectType || 'residential construction'} project in ${location.city || location.county || ''}, ${location.state}${location.zipCode ? ` (ZIP: ${location.zipCode})` : ''}.

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

${searchContext ? 'Use the provided search context to give accurate, current, jurisdiction-specific requirements with actual code section numbers.' : 'Provide requirements based on current IBC/IRC standards applicable to this jurisdiction.'}

Provide response in JSON format with categories and specific requirements.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: codePrompt,
        },
      ],
      max_tokens: 1500,
    });

    const codesText = response.choices[0]?.message?.content || '';

    let codesData: unknown;
    try {
      codesData = JSON.parse(codesText);
    } catch {
      codesData = {
        rawData: codesText,
        categories: [],
      };
    }

    const result = {
      success: true,
      location,
      agencies,
      codes: codesData,
      model: 'gpt-4o',
      searchGrounded: !!searchContext,
      disclaimer: searchContext
        ? 'AI-generated code requirements based on current web sources. Always verify with local building department.'
        : 'AI-generated code requirements (no live search context). Always verify with local building department.',
    };

    logPlatformEvent({
      type: 'building_codes_generated',
      entityType: 'compliance',
      entityId: `${location.state}:${location.city || location.county || 'unknown'}`,
      metadata: {
        state: location.state,
        city: location.city,
        county: location.county,
        projectType,
        model: result.model,
        searchGrounded: result.searchGrounded,
      },
    });

    return result;
  } catch (aiError: unknown) {
    console.error('OpenAI API error:', aiError);

    const result = {
      success: true,
      location,
      agencies,
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
      searchGrounded: false,
      disclaimer: 'Mock building codes (fallback) — configure OPENAI_API_KEY for AI-generated codes with Tavily live search.',
    };

    logPlatformEvent({
      type: 'building_codes_generated',
      entityType: 'compliance',
      entityId: `${location.state}:${location.city || location.county || 'unknown'}`,
      metadata: {
        state: location.state,
        city: location.city,
        county: location.county,
        projectType,
        model: result.model,
      },
    });

    return result;
  }
}

function getInsulationValue(state: string, type: 'wall' | 'ceiling'): number {
  const coldStates = ['AK', 'MN', 'ND', 'SD', 'MT', 'WI', 'MI', 'ME', 'VT', 'NH'];
  const warmStates = ['FL', 'HI', 'AZ', 'TX', 'LA', 'GA'];

  if (type === 'wall') {
    if (coldStates.includes(state)) return 21;
    if (warmStates.includes(state)) return 13;
    return 15;
  }

  if (coldStates.includes(state)) return 49;
  if (warmStates.includes(state)) return 30;
  return 38;
}
