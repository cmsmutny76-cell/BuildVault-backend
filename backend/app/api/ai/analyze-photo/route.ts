import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * POST /api/ai/analyze-photo
 * Analyze construction photo using OpenAI Vision API
 */
export async function POST(request: NextRequest) {
  try {
    const { photoUrl, projectType } = await request.json();

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'Photo URL is required' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    // Create prompt for construction analysis
    const prompt = `Analyze this ${projectType || 'construction'} photo and provide:
1. Estimated measurements (dimensions, area)
2. Materials needed (type and estimated quantity)
3. Condition assessment
4. Recommendations

Provide the response in JSON format.`;

    // Call OpenAI Vision API
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
                image_url: { url: photoUrl },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const analysisText = response.choices[0]?.message?.content || '';
      
      // Parse AI response
      let analysisData;
      try {
        analysisData = JSON.parse(analysisText);
      } catch {
        // If not JSON, structure the text response
        analysisData = {
          rawAnalysis: analysisText,
          measurements: {},
          materials: [],
          condition: 'Unknown',
          recommendations: [],
        };
      }

      return NextResponse.json({
        success: true,
        analysis: analysisData,
        model: 'gpt-4o',
      });
    } catch (aiError: any) {
      console.error('OpenAI API error:', aiError);
      
      // Return mock data if API fails (for MVP testing)
      return NextResponse.json({
        success: true,
        analysis: {
          measurements: {
            estimatedArea: '200 sqft',
            dimensions: '10ft x 20ft',
          },
          materials: [
            { name: 'Flooring planks', quantity: '25 boxes', unit: 'box' },
            { name: 'Underlayment', quantity: '200 sqft', unit: 'sqft' },
            { name: 'Adhesive', quantity: '3 gallons', unit: 'gallon' },
          ],
          condition: 'Good - Surface appears level',
          recommendations: [
            'Remove existing flooring first',
            'Check for moisture issues',
            'Ensure proper ventilation during installation',
          ],
        },
        model: 'mock-data',
        note: 'Using mock data - configure OPENAI_API_KEY for real analysis',
      });
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze photo' },
      { status: 500 }
    );
  }
}
