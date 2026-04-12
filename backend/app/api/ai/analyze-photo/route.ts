import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import { fetchBuildingCodes } from '../../../../lib/services/complianceService';
import { generateMaterialQuoteWithCatalog } from '../../../../lib/services/estimateService';
import { saveProjectDocument } from '../../../../lib/services/projectDocumentService';
import { getProjectById } from '../../../../lib/services/projectService';
import { recordMaterialSearchObservations } from '../../../../lib/services/materialCatalogService';
import { estimateCodeHardwareQuantities } from '../../../../lib/services/hardwareQuantityService';
import {
  toTitleCase,
  buildBuildingCodesReportText,
  buildMaterialsQuoteReportText,
  NormalizedMaterial,
  mergeMaterials,
  inferApplicableHardware,
} from '../../../../lib/services/reportBuilderService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getAuthenticatedUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { userId?: string };
    return typeof decoded.userId === 'string' ? decoded.userId : null;
  } catch {
    // Dev fallback token support from auth/login route
    try {
      const parsed = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as {
        userId?: string;
        exp?: number;
      };

      if (typeof parsed.exp === 'number' && Date.now() > parsed.exp) {
        return null;
      }

      return typeof parsed.userId === 'string' ? parsed.userId : null;
    } catch {
      return null;
    }
  }
}


function buildPhotoAnalysisReportText(input: {
  analysisData: any;
  materialQuote: any;
  compliance?: any;
  projectType?: string;
  location?: { city?: string; state?: string; zipCode?: string } | null;
}) {
  const { analysisData, materialQuote, compliance, projectType, location } = input;
  const lines: string[] = [];
  lines.push('PHOTO ANALYSIS REPORT');
  lines.push(`Project Type: ${projectType ? toTitleCase(projectType) : 'General Project'}`);
  lines.push(`Location: ${location?.city || 'N/A'}, ${location?.state || 'N/A'} ${location?.zipCode || ''}`.trim());
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');

  lines.push('Summary:');
  lines.push(String(analysisData?.summary || analysisData?.rawAnalysis || 'No summary provided.'));
  lines.push('');

  const materials = Array.isArray(analysisData?.materials) ? analysisData.materials : [];
  lines.push('Materials Identified:');
  if (materials.length === 0) {
    lines.push('- No materials identified.');
  } else {
    for (const item of materials) {
      lines.push(`- ${item?.name || 'Unknown'}: ${item?.quantity || 'N/A'} ${item?.unit || ''}`);
    }
  }

  const dimensions = analysisData?.dimensions || analysisData?.measurements || {};
  lines.push('');
  lines.push('Measurements:');
  lines.push(`- Length: ${dimensions?.length || 'N/A'}`);
  lines.push(`- Width: ${dimensions?.width || 'N/A'}`);
  lines.push(`- Area: ${dimensions?.area || dimensions?.estimatedArea || 'N/A'}`);

  lines.push('');
  lines.push(`Estimated Total Materials Cost: $${materialQuote?.totalCost || '0.00'}`);

  if (compliance) {
    lines.push('');
    lines.push('Code Regulations Summary:');
    lines.push(String(compliance?.disclaimer || 'Verify all code items with local jurisdiction.'));
  }

  return lines.join('\n');
}

/**
 * POST /api/ai/analyze-photo
 * Analyze construction photo using OpenAI Vision API
 */
export async function POST(request: NextRequest) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { photoUrl, projectType, projectId, location, userId, comparisonStores } = await request.json();
    if (userId && userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: 'Forbidden: user mismatch' },
        { status: 403 }
      );
    }

    const effectiveUserId = authenticatedUserId;
    const openAiApiKey = process.env.OPENAI_API_KEY || '';
    const allowMockFallback = process.env.ALLOW_MOCK_AI_FALLBACK === 'true';

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'Photo URL is required' },
        { status: 400 }
      );
    }

    if (projectId) {
      const project = await getProjectById(projectId);
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
    }

    if (!openAiApiKey && !allowMockFallback) {
      return NextResponse.json(
        {
          error: 'OPENAI_API_KEY is not configured. Add it to backend/.env to enable real photo analysis.',
        },
        { status: 503 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openAiApiKey,
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

      const resolvedLocation = location || null;
      const codesResult = resolvedLocation?.state
        ? await fetchBuildingCodes(resolvedLocation, projectType)
        : null;

      const baseMaterials: NormalizedMaterial[] = (analysisData.materials || []).map((item: any) => ({
        name: String(item?.name || '').trim(),
        quantity: String(item?.quantity || 'N/A'),
        unit: String(item?.unit || 'unit'),
      })).filter((item: NormalizedMaterial) => item.name.length > 0);

      const inferredHardware = inferApplicableHardware({
        baseMaterials,
        state: resolvedLocation?.state,
        projectType,
        codes: codesResult?.codes,
      });

      const hardwareEstimation = await estimateCodeHardwareQuantities({
        hardwareItems: inferredHardware,
        baseMaterials,
        analysisData,
        projectType,
        location: resolvedLocation,
        contextType: 'photo',
      });
      const estimatedHardware = hardwareEstimation.items;

      const buildingCodesReportText = buildBuildingCodesReportText({
        location: resolvedLocation,
        projectType,
        agencies: (codesResult as any)?.agencies || null,
        codes: codesResult?.codes || null,
        disclaimer: codesResult?.disclaimer,
      });

      const quoteMaterials = mergeMaterials(baseMaterials, estimatedHardware);

      const materialQuote = await generateMaterialQuoteWithCatalog({
        materials: quoteMaterials,
        projectType,
        zipCode: resolvedLocation?.zipCode,
        city: resolvedLocation?.city,
        state: resolvedLocation?.state,
        comparisonStores: Array.isArray(comparisonStores) ? comparisonStores : [],
      });

      const responsePayload = {
        success: true,
        analysis: analysisData,
        compliance: codesResult?.codes || null,
        agencies: (codesResult as any)?.agencies || null,
        complianceSummary: codesResult?.disclaimer || (resolvedLocation?.state ? 'Verify local code requirements with your jurisdiction.' : 'No state provided, so code lookup is limited.'),
        buildingCodesReportText,
        codeRequiredHardware: estimatedHardware,
        hardwareQuantityMethod: hardwareEstimation.method,
        materialQuote,
        photoReportText: buildPhotoAnalysisReportText({
          analysisData,
          materialQuote,
          compliance: codesResult,
          projectType,
          location: resolvedLocation,
        }),
        materialsQuoteReportText: buildMaterialsQuoteReportText(materialQuote, {
          projectType,
          location: resolvedLocation,
        }),
        model: 'gpt-4o',
      };

      await recordMaterialSearchObservations({
        projectId,
        source: 'ai-analyze-photo',
        projectType,
        location: resolvedLocation || undefined,
        materials: materialQuote.materials,
      });

      if (projectId) {
        await saveProjectDocument({
          projectId,
          createdByUserId: effectiveUserId,
          type: 'photo-analysis-report',
          title: `Photo Analysis Report - ${projectType || 'General Project'}`,
          tags: ['photo-analysis', projectType || 'general'],
          data: {
            reportText: responsePayload.photoReportText,
          },
        });

        await saveProjectDocument({
          projectId,
          createdByUserId: effectiveUserId,
          type: 'materials-quote-report',
          title: `Materials Quote Report - ${projectType || 'General Project'}`,
          tags: ['materials-quote', projectType || 'general'],
          data: {
            reportText: responsePayload.materialsQuoteReportText,
          },
        });
      }

      return NextResponse.json(responsePayload);
    } catch (aiError: any) {
      console.error('OpenAI API error:', aiError);

      if (!allowMockFallback) {
        return NextResponse.json(
          {
            error: 'Photo analysis failed while calling OpenAI. Check OPENAI_API_KEY and API access.',
            details: aiError?.message || 'Unknown OpenAI error',
          },
          { status: 502 }
        );
      }
      
      // Return mock data if API fails (for MVP testing)
      const fallbackAnalysis = {
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
      };

      const resolvedLocation = location || null;
      const codesResult = resolvedLocation?.state
        ? await fetchBuildingCodes(resolvedLocation, projectType)
        : null;

      const baseMaterials: NormalizedMaterial[] = fallbackAnalysis.analysis.materials.map((item: any) => ({
        name: String(item?.name || '').trim(),
        quantity: String(item?.quantity || 'N/A'),
        unit: String(item?.unit || 'unit'),
      })).filter((item: NormalizedMaterial) => item.name.length > 0);

      const inferredHardware = inferApplicableHardware({
        baseMaterials,
        state: resolvedLocation?.state,
        projectType,
        codes: codesResult?.codes,
      });

      const hardwareEstimation = await estimateCodeHardwareQuantities({
        hardwareItems: inferredHardware,
        baseMaterials,
        analysisData: fallbackAnalysis.analysis,
        projectType,
        location: resolvedLocation,
        contextType: 'photo',
      });
      const estimatedHardware = hardwareEstimation.items;

      const buildingCodesReportText = buildBuildingCodesReportText({
        location: resolvedLocation,
        projectType,
        agencies: (codesResult as any)?.agencies || null,
        codes: codesResult?.codes || null,
        disclaimer: codesResult?.disclaimer,
      });

      const quoteMaterials = mergeMaterials(baseMaterials, estimatedHardware);

      const materialQuote = await generateMaterialQuoteWithCatalog({
        materials: quoteMaterials,
        projectType,
        zipCode: resolvedLocation?.zipCode,
        city: resolvedLocation?.city,
        state: resolvedLocation?.state,
        comparisonStores: Array.isArray(comparisonStores) ? comparisonStores : [],
      });

      const payload = {
        ...fallbackAnalysis,
        compliance: codesResult?.codes || null,
        agencies: (codesResult as any)?.agencies || null,
        complianceSummary: codesResult?.disclaimer || (resolvedLocation?.state ? 'Verify local code requirements with your jurisdiction.' : 'No state provided, so code lookup is limited.'),
        buildingCodesReportText,
        codeRequiredHardware: estimatedHardware,
        hardwareQuantityMethod: hardwareEstimation.method,
        materialQuote,
        photoReportText: buildPhotoAnalysisReportText({
          analysisData: fallbackAnalysis.analysis,
          materialQuote,
          compliance: codesResult,
          projectType,
          location: resolvedLocation,
        }),
        materialsQuoteReportText: buildMaterialsQuoteReportText(materialQuote, {
          projectType,
          location: resolvedLocation,
        }),
        model: 'mock-data',
        note: 'Using mock data - configure OPENAI_API_KEY for real analysis',
      };

      await recordMaterialSearchObservations({
        projectId,
        source: 'ai-analyze-photo-mock',
        projectType,
        location: resolvedLocation || undefined,
        materials: materialQuote.materials,
      });

      if (projectId) {
        await saveProjectDocument({
          projectId,
          createdByUserId: effectiveUserId,
          type: 'photo-analysis-report',
          title: `Photo Analysis Report - ${projectType || 'General Project'}`,
          tags: ['photo-analysis', projectType || 'general'],
          data: {
            reportText: payload.photoReportText,
          },
        });

        await saveProjectDocument({
          projectId,
          createdByUserId: effectiveUserId,
          type: 'materials-quote-report',
          title: `Materials Quote Report - ${projectType || 'General Project'}`,
          tags: ['materials-quote', projectType || 'general'],
          data: {
            reportText: payload.materialsQuoteReportText,
          },
        });
      }

      return NextResponse.json(payload);
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze photo' },
      { status: 500 }
    );
  }
}
