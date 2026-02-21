import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * POST /api/ai/analyze-blueprint
 * Analyze construction blueprints using OpenAI Vision API
 * Extracts measurements, materials, and quantities from architectural drawings
 */
export async function POST(request: NextRequest) {
  try {
    const { blueprintUrl, location } = await request.json();

    if (!blueprintUrl) {
      return NextResponse.json(
        { error: 'Blueprint URL is required' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    // Create detailed prompt for blueprint analysis
    const prompt = `Analyze this construction blueprint/architectural drawing in detail and provide:

1. DIMENSIONS & MEASUREMENTS:
   - Overall dimensions (length, width, height)
   - Room dimensions
   - Wall lengths and heights
   - Opening sizes (doors, windows)
   
2. MATERIAL QUANTITIES:
   - Framing lumber (2x4, 2x6, etc.) with linear footage
   - Drywall/sheetrock (square footage)
   - Flooring materials (square footage by room)
   - Roofing materials (if applicable)
   - Windows and doors (count, sizes)
   - Insulation (square footage/R-value)
   - Electrical boxes, outlets, switches (count)
   - Plumbing fixtures (if shown)
   
3. STRUCTURAL ELEMENTS:
   - Foundation requirements
   - Wall types (load-bearing, partition)
   - Ceiling heights
   - Roof pitch and type
   
4. SPECIFICATIONS:
   - Note any specifications or callouts
   - Material grades or types specified
   - Special requirements
   
5. MISSING INFORMATION:
   - What additional details would be needed
   - Assumptions made in the analysis

Provide the response in JSON format with clear categories and quantities.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { 
                  url: blueprintUrl,
                  detail: 'high' // Use high detail for blueprints
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
      });

      const analysisText = response.choices[0]?.message?.content || '';
      
      let blueprintData;
      try {
        blueprintData = JSON.parse(analysisText);
      } catch {
        // Structure the text response if not JSON
        blueprintData = {
          rawAnalysis: analysisText,
          dimensions: {},
          materials: [],
          structural: {},
          specifications: [],
          notes: [],
        };
      }

      // If location provided, fetch building codes
      let buildingCodes = null;
      if (location) {
        const codesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/building-codes/fetch`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location }),
          }
        );
        
        if (codesResponse.ok) {
          const codesData = await codesResponse.json();
          buildingCodes = codesData.codes;
        }
      }

      return NextResponse.json({
        success: true,
        blueprint: blueprintData,
        buildingCodes,
        model: 'gpt-4o',
        analysisType: 'blueprint',
      });
    } catch (aiError: any) {
      console.error('OpenAI API error:', aiError);
      
      // Return mock blueprint data for testing
      return NextResponse.json({
        success: true,
        blueprint: {
          dimensions: {
            overallLength: '40 ft',
            overallWidth: '30 ft',
            ceilingHeight: '9 ft',
            totalSquareFootage: '1200 sqft',
          },
          materials: [
            {
              category: 'Framing Lumber',
              items: [
                { name: '2x4x8 Studs', quantity: 120, unit: 'pieces' },
                { name: '2x6x12 Headers', quantity: 24, unit: 'pieces' },
                { name: '2x10x16 Floor Joists', quantity: 30, unit: 'pieces' },
              ],
            },
            {
              category: 'Drywall',
              items: [
                { name: '4x8 Drywall Sheets (1/2")', quantity: 65, unit: 'sheets' },
                { name: 'Joint Compound', quantity: 12, unit: 'boxes' },
                { name: 'Drywall Screws', quantity: 8, unit: 'lbs' },
              ],
            },
            {
              category: 'Flooring',
              items: [
                { name: 'Hardwood Flooring', quantity: 1250, unit: 'sqft' },
                { name: 'Underlayment', quantity: 1250, unit: 'sqft' },
              ],
            },
            {
              category: 'Electrical',
              items: [
                { name: 'Electrical Outlets', quantity: 24, unit: 'units' },
                { name: 'Light Switches', quantity: 12, unit: 'units' },
                { name: 'Junction Boxes', quantity: 36, unit: 'units' },
                { name: 'Romex Wire 14/2', quantity: 500, unit: 'ft' },
              ],
            },
          ],
          structural: {
            foundationType: 'Slab on grade',
            wallType: 'Wood frame 2x4',
            roofType: 'Gable, 6/12 pitch',
            loadBearingWalls: ['North wall', 'Center wall'],
          },
          specifications: [
            'R-13 insulation in exterior walls',
            'R-30 insulation in ceiling',
            'All lumber to be #2 grade or better',
            'Pressure-treated lumber for sill plates',
          ],
          notes: [
            'Blueprint analysis is based on visible details',
            'Verify all measurements on-site',
            'Local building codes may require additional materials',
          ],
        },
        buildingCodes: location ? {
          location: location,
          codes: [
            {
              category: 'Structural',
              requirements: [
                'All framing lumber must meet local grade standards',
                'Hurricane ties required for roof joists',
                'Foundation anchors every 6 feet',
              ],
            },
            {
              category: 'Electrical',
              requirements: [
                'GFCI outlets required within 6 feet of water sources',
                'Arc-fault breakers required in living areas',
                'Minimum one outlet per 12 feet of wall',
              ],
            },
          ],
        } : null,
        model: 'mock-data',
        note: 'Using mock data - configure OPENAI_API_KEY for real analysis',
      });
    }
  } catch (error) {
    console.error('Blueprint analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze blueprint' },
      { status: 500 }
    );
  }
}
