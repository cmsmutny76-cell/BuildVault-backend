import { NextRequest, NextResponse } from 'next/server';
import { generateMaterialQuoteWithCatalog, type MaterialQuoteRequest } from '../../../../lib/services/estimateService';
import OpenAI from 'openai';
import { recordMaterialSearchObservations } from '../../../../lib/services/materialCatalogService';

async function discoverLocalSuppliers(input: { city?: string; state?: string; zipCode?: string; projectType?: string }) {
  const fallback = [
    `${input.city || 'Local'} Hardware & Supply`,
    `${input.city || 'Local'} Building Materials`,
  ];

  try {
    if (!process.env.OPENAI_API_KEY) {
      return fallback;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `List 4 likely local hardware/building supply store names for ${input.city || ''}, ${input.state || ''} ${input.zipCode || ''} for ${input.projectType || 'construction'} projects. Return JSON array of names only.`,
        },
      ],
      max_tokens: 150,
    });

    const text = completion.choices[0]?.message?.content || '[]';
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((store) => String(store)).filter(Boolean).slice(0, 6);
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * POST /api/material-quotes/generate
 * Generate material quote with retailer pricing.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MaterialQuoteRequest & { userAddedStores?: string[] };

    if (!Array.isArray(body.materials) || !body.materials.length) {
      return NextResponse.json(
        { success: false, error: 'materials list is required' },
        { status: 400 }
      );
    }

    const aiLocalStores = await discoverLocalSuppliers({
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      projectType: body.projectType,
    });

    const quote = await generateMaterialQuoteWithCatalog({
      ...body,
      comparisonStores: [...(body.comparisonStores || []), ...(body.userAddedStores || []), ...aiLocalStores],
    });

    await recordMaterialSearchObservations({
      projectId: (body as any).projectId,
      source: 'material-quotes-generate',
      projectType: body.projectType,
      location: {
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
      },
      materials: quote.materials,
    });

    return NextResponse.json({
      success: true,
      quote,
      aiLocalStores,
    });
  } catch (error) {
    console.error('Material quote generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate material quote' },
      { status: 500 }
    );
  }
}
