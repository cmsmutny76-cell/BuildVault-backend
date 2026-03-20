import { NextRequest, NextResponse } from 'next/server';
import { generateMaterialQuote, type MaterialQuoteRequest } from '../../../../lib/services/estimateService';

/**
 * POST /api/material-quotes/generate
 * Generate material quote with retailer pricing.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MaterialQuoteRequest;

    if (!Array.isArray(body.materials) || !body.materials.length) {
      return NextResponse.json(
        { success: false, error: 'materials list is required' },
        { status: 400 }
      );
    }

    const quote = generateMaterialQuote(body);

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error) {
    console.error('Material quote generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate material quote' },
      { status: 500 }
    );
  }
}
