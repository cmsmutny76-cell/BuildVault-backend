import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import { fetchBuildingCodes } from '../../../../lib/services/complianceService';
import { generateMaterialQuoteWithCatalog } from '../../../../lib/services/estimateService';
import { saveProjectDocument, listProjectDocuments } from '../../../../lib/services/projectDocumentService';
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


function buildBlueprintReportText(input: {
  blueprintData: any;
  materialQuote: any;
  compliance?: any;
  projectType?: string;
  location?: { city?: string; state?: string; zipCode?: string } | null;
  blueprintCount: number;
}) {
  const { blueprintData, materialQuote, compliance, projectType, location, blueprintCount } = input;
  const lines: string[] = [];
  lines.push('BLUEPRINT ANALYSIS REPORT');
  lines.push(`Project Type: ${projectType ? toTitleCase(projectType) : 'General Project'}`);
  lines.push(`Blueprint Files Analyzed: ${blueprintCount}`);
  lines.push(`Location: ${location?.city || 'N/A'}, ${location?.state || 'N/A'} ${location?.zipCode || ''}`.trim());
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');

  const dimensions = blueprintData?.dimensions || {};
  lines.push('Dimensions:');
  const dimensionEntries = Object.entries(dimensions);
  if (dimensionEntries.length === 0) {
    lines.push('- No dimension data extracted.');
  } else {
    for (const [key, value] of dimensionEntries) {
      lines.push(`- ${toTitleCase(key)}: ${String(value)}`);
    }
  }

  lines.push('');
  lines.push('Materials Identified:');
  const materialGroups = Array.isArray(blueprintData?.materials) ? blueprintData.materials : [];
  if (materialGroups.length === 0) {
    lines.push('- No material groups identified.');
  } else {
    for (const group of materialGroups) {
      const groupName = group?.category || group?.name || 'General';
      lines.push(`- ${groupName}`);
      const items = Array.isArray(group?.items) ? group.items : [];
      for (const item of items) {
        lines.push(`  • ${item?.name || 'Unknown'}: ${item?.quantity || 'N/A'} ${item?.unit || ''}`);
      }
    }
  }

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
 * POST /api/ai/analyze-blueprint
 * Analyze construction blueprints using OpenAI Vision API
 * Extracts measurements, materials, and quantities from architectural drawings
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

    const { blueprintUrl, blueprintUrls, location, projectId, projectType, userId, comparisonStores } = await request.json();
    if (userId && userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: 'Forbidden: user mismatch' },
        { status: 403 }
      );
    }

    const effectiveUserId = authenticatedUserId;
    const openAiApiKey = process.env.OPENAI_API_KEY || '';
    const allowMockFallback = process.env.ALLOW_MOCK_AI_FALLBACK === 'true';

    const resolvedBlueprintUrls = Array.isArray(blueprintUrls)
      ? blueprintUrls.filter((url: unknown): url is string => typeof url === 'string' && url.trim().length > 0)
      : [];

    if (resolvedBlueprintUrls.length === 0 && typeof blueprintUrl === 'string' && blueprintUrl.trim()) {
      resolvedBlueprintUrls.push(blueprintUrl.trim());
    }

    if (resolvedBlueprintUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one blueprint URL is required' },
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
          error: 'OPENAI_API_KEY is not configured. Add it to backend/.env to enable real blueprint analysis.',
        },
        { status: 503 }
      );
    }

    const historicalDocs = projectId ? await listProjectDocuments(projectId) : [];
    const historicalContext = historicalDocs
      .slice(0, 5)
      .map((doc) => `${doc.type}: ${doc.title}`)
      .join('; ');

    const openai = new OpenAI({
      apiKey: openAiApiKey,
    });

    // Create detailed prompt for blueprint analysis
    const prompt = `Analyze this construction blueprint/architectural drawing set (${resolvedBlueprintUrls.length} file${resolvedBlueprintUrls.length === 1 ? '' : 's'}) in detail and provide:

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
  - Required hardware not explicitly listed in blueprint (anchors, hangers, connectors, fasteners, code-required outlets/protection)
   
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

6. HISTORICAL CONTEXT:
  - Use this previous project context (if relevant) to improve consistency: ${historicalContext || 'None provided'}

Provide the response in JSON format with clear categories and quantities.`;

    const promptContent: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string; detail: 'high' } }> = [
      { type: 'text', text: prompt },
      ...resolvedBlueprintUrls.map((url) => ({
        type: 'image_url' as const,
        image_url: {
          url,
          detail: 'high' as const,
        },
      })),
    ];

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: promptContent,
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

      const codesResult = location?.state
        ? await fetchBuildingCodes(location, projectType)
        : null;

      const materialItems = Array.isArray(blueprintData.materials)
        ? blueprintData.materials.flatMap((group: any) =>
            Array.isArray(group.items)
              ? group.items.map((item: any) => ({
                  name: item.name,
                  quantity: String(item.quantity),
                  unit: item.unit || 'unit',
                }))
              : []
          )
        : [];

      const inferredHardware = inferApplicableHardware({
        baseMaterials: materialItems,
        state: location?.state,
        projectType,
        codes: codesResult?.codes,
      });

      const hardwareEstimation = await estimateCodeHardwareQuantities({
        hardwareItems: inferredHardware,
        baseMaterials: materialItems,
        analysisData: blueprintData,
        projectType,
        location,
        contextType: 'blueprint',
      });
      const estimatedHardware = hardwareEstimation.items;

      const buildingCodesReportText = buildBuildingCodesReportText({
        location,
        projectType,
        agencies: (codesResult as any)?.agencies || null,
        codes: codesResult?.codes || null,
        disclaimer: codesResult?.disclaimer,
      });

      const quoteMaterials = mergeMaterials(materialItems, estimatedHardware);

      const materialQuote = await generateMaterialQuoteWithCatalog({
        materials: quoteMaterials,
        projectType,
        zipCode: location?.zipCode,
        city: location?.city,
        state: location?.state,
        comparisonStores: Array.isArray(comparisonStores) ? comparisonStores : [],
      });

      const payload = {
        success: true,
        blueprint: blueprintData,
        buildingCodes: codesResult?.codes || null,
        agencies: codesResult?.agencies || null,
        complianceSummary: codesResult?.disclaimer || (location?.state ? 'Verify local code requirements with your jurisdiction.' : 'No state provided, so code lookup is limited.'),
        buildingCodesReportText,
        codeRequiredHardware: estimatedHardware,
        hardwareQuantityMethod: hardwareEstimation.method,
        materialQuote,
        blueprintReportText: buildBlueprintReportText({
          blueprintData,
          materialQuote,
          compliance: codesResult,
          projectType,
          location,
          blueprintCount: resolvedBlueprintUrls.length,
        }),
        materialsQuoteReportText: buildMaterialsQuoteReportText(materialQuote, {
          projectType,
          location,
        }),
        blueprintSources: resolvedBlueprintUrls,
        analyzedBlueprintCount: resolvedBlueprintUrls.length,
        model: 'gpt-4o',
        analysisType: 'blueprint',
      };

      await recordMaterialSearchObservations({
        projectId,
        source: 'ai-analyze-blueprint',
        projectType,
        location,
        materials: materialQuote.materials,
      });

      if (projectId) {
        await saveProjectDocument({
          projectId,
          createdByUserId: effectiveUserId,
          type: 'blueprint-analysis-report',
          title: `Blueprint Analysis Report (${resolvedBlueprintUrls.length} file${resolvedBlueprintUrls.length === 1 ? '' : 's'}) - ${projectType || 'General Project'}`,
          tags: ['blueprint-analysis', projectType || 'general'],
          data: {
            reportText: payload.blueprintReportText,
          },
        });

        await saveProjectDocument({
          projectId,
          createdByUserId: effectiveUserId,
          type: 'materials-quote-report',
          title: `Blueprint Materials Quote - ${projectType || 'General Project'}`,
          tags: ['materials-quote', 'blueprint', projectType || 'general'],
          data: {
            reportText: payload.materialsQuoteReportText,
          },
        });
      }

      return NextResponse.json(payload);
    } catch (aiError: any) {
      console.error('OpenAI API error:', aiError);

      if (!allowMockFallback) {
        return NextResponse.json(
          {
            error: 'Blueprint analysis failed while calling OpenAI. Check OPENAI_API_KEY and API access.',
            details: aiError?.message || 'Unknown OpenAI error',
          },
          { status: 502 }
        );
      }
      
      // Return mock blueprint data for testing
      const mockResult = {
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
        blueprintSources: resolvedBlueprintUrls,
        analyzedBlueprintCount: resolvedBlueprintUrls.length,
      };

      const codesResult = location?.state
        ? await fetchBuildingCodes(location, projectType)
        : null;

      const materialItems = mockResult.blueprint.materials.flatMap((group: any) =>
        group.items.map((item: any) => ({
          name: item.name,
          quantity: String(item.quantity),
          unit: item.unit || 'unit',
        }))
      );

      const inferredHardware = inferApplicableHardware({
        baseMaterials: materialItems,
        state: location?.state,
        projectType,
        codes: codesResult?.codes,
      });

      const hardwareEstimation = await estimateCodeHardwareQuantities({
        hardwareItems: inferredHardware,
        baseMaterials: materialItems,
        analysisData: mockResult.blueprint,
        projectType,
        location,
        contextType: 'blueprint',
      });
      const estimatedHardware = hardwareEstimation.items;

      const buildingCodesReportText = buildBuildingCodesReportText({
        location,
        projectType,
        agencies: (codesResult as any)?.agencies || null,
        codes: codesResult?.codes || null,
        disclaimer: codesResult?.disclaimer,
      });

      const quoteMaterials = mergeMaterials(materialItems, estimatedHardware);

      const materialQuote = await generateMaterialQuoteWithCatalog({
        materials: quoteMaterials,
        projectType,
        zipCode: location?.zipCode,
        city: location?.city,
        state: location?.state,
        comparisonStores: Array.isArray(comparisonStores) ? comparisonStores : [],
      });

      const payload = {
        ...mockResult,
        buildingCodes: codesResult?.codes || null,
        agencies: codesResult?.agencies || null,
        complianceSummary: codesResult?.disclaimer || (location?.state ? 'Verify local code requirements with your jurisdiction.' : 'No state provided, so code lookup is limited.'),
        buildingCodesReportText,
        codeRequiredHardware: estimatedHardware,
        hardwareQuantityMethod: hardwareEstimation.method,
        materialQuote,
        blueprintReportText: buildBlueprintReportText({
          blueprintData: mockResult.blueprint,
          materialQuote,
          compliance: codesResult,
          projectType,
          location,
          blueprintCount: resolvedBlueprintUrls.length,
        }),
        materialsQuoteReportText: buildMaterialsQuoteReportText(materialQuote, {
          projectType,
          location,
        }),
        model: 'mock-data',
        note: 'Using mock data - configure OPENAI_API_KEY for real analysis',
      };

      await recordMaterialSearchObservations({
        projectId,
        source: 'ai-analyze-blueprint-mock',
        projectType,
        location,
        materials: materialQuote.materials,
      });

      if (projectId) {
        await saveProjectDocument({
          projectId,
          createdByUserId: effectiveUserId,
          type: 'blueprint-analysis-report',
          title: `Blueprint Analysis Report (${resolvedBlueprintUrls.length} file${resolvedBlueprintUrls.length === 1 ? '' : 's'}) - ${projectType || 'General Project'}`,
          tags: ['blueprint-analysis', projectType || 'general'],
          data: {
            reportText: payload.blueprintReportText,
          },
        });

        await saveProjectDocument({
          projectId,
          createdByUserId: effectiveUserId,
          type: 'materials-quote-report',
          title: `Blueprint Materials Quote - ${projectType || 'General Project'}`,
          tags: ['materials-quote', 'blueprint', projectType || 'general'],
          data: {
            reportText: payload.materialsQuoteReportText,
          },
        });
      }

      return NextResponse.json(payload);
    }
  } catch (error) {
    console.error('Blueprint analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze blueprint' },
      { status: 500 }
    );
  }
}
