import { NextRequest, NextResponse } from 'next/server';
import {
  type EstimateLineItemInput,
} from '../../../../lib/domain/estimate';
import {
  createEstimate,
  generateMaterialQuote,
  listProjectEstimates,
  type MaterialQuoteRequest,
} from '../../../../lib/services/estimateService';
import { projectExists } from '../../../../lib/services/projectService';

/**
 * GET /api/quotes/generate?projectId=xxx
 * Compatibility shim. Use GET /api/estimates.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      estimates: await listProjectEstimates(projectId),
      deprecated: true,
      replacement: '/api/estimates',
    });
  } catch (error) {
    console.error('Get estimates error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve estimates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quotes/generate
 * Compatibility shim. Use POST /api/estimates or POST /api/material-quotes/generate.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const isEstimateRequest =
      Array.isArray(body.lineItems) &&
      typeof body.projectId === 'string' &&
      typeof body.contractorId === 'string' &&
      typeof body.projectTitle === 'string';

    if (isEstimateRequest) {
      const {
        projectId,
        contractorId,
        projectTitle,
        lineItems,
        notes,
        validDays = 30,
      }: {
        projectId: string;
        contractorId: string;
        projectTitle: string;
        lineItems: EstimateLineItemInput[];
        notes?: string;
        validDays?: number;
      } = body;

      if (!lineItems.length) {
        return NextResponse.json(
          { success: false, error: 'At least one line item is required' },
          { status: 400 }
        );
      }

      if (!(await projectExists(projectId))) {
        return NextResponse.json(
          { success: false, error: 'projectId does not exist' },
          { status: 404 }
        );
      }

      const estimate = await createEstimate({
        projectId,
        contractorId,
        projectTitle,
        lineItems,
        notes,
        validDays,
      });

      return NextResponse.json({
        success: true,
        estimate,
        deprecated: true,
        replacement: '/api/estimates',
      });
    }

    const { materials, projectType, zipCode } = body as MaterialQuoteRequest;

    if (!materials || !Array.isArray(materials)) {
      return NextResponse.json(
        { success: false, error: 'Materials list is required' },
        { status: 400 }
      );
    }

    const quote = generateMaterialQuote({ materials, projectType, zipCode });

    return NextResponse.json({
      success: true,
      quote,
      deprecated: true,
      replacement: '/api/material-quotes/generate',
    });
  } catch (error) {
    console.error('Quote generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    );
  }
}
