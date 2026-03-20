import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface GenerateDescriptionRequest {
  projectType: string;
  scope: string;
  budget?: number;
  timeline?: string;
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
  };
  homeownerNotes?: string;
}

/**
 * POST /api/ai/generate-description
 * Generate a professional construction project description.
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateDescriptionRequest = await request.json();
    const { projectType, scope, budget, timeline, location, homeownerNotes } = body;

    if (!projectType || !scope) {
      return NextResponse.json(
        { success: false, error: 'projectType and scope are required' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({
        success: true,
        result: buildMockDescription(body),
        model: 'mock-data',
        note: 'Using mock data - set OPENAI_API_KEY for AI-generated descriptions',
      });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const prompt = `You are an expert construction estimator and project planner.
Create a polished, client-ready project description in JSON for this construction request:

Project Type: ${projectType}
Scope: ${scope}
Budget: ${budget ? `$${budget.toLocaleString()}` : 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Location: ${location ? `${location.city || ''} ${location.state || ''} ${location.zipCode || ''}`.trim() : 'Not specified'}
Homeowner Notes: ${homeownerNotes || 'None'}

Return strict JSON with these keys:
- title (string)
- summary (string, 2-4 sentences)
- scopeOfWork (string[])
- assumptions (string[])
- risksAndConsiderations (string[])
- recommendedNextSteps (string[])
Tone: professional, clear, non-salesy.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.4,
      });

      const content = response.choices[0]?.message?.content || '';
      const parsed = safeParseJson(content);

      return NextResponse.json({
        success: true,
        result: parsed || buildTextFallback(content, body),
        model: 'gpt-4o-mini',
      });
    } catch (aiError) {
      console.error('OpenAI description generation error:', aiError);
      return NextResponse.json({
        success: true,
        result: buildMockDescription(body),
        model: 'mock-data',
        note: 'Falling back to mock description because AI call failed',
      });
    }
  } catch (error) {
    console.error('Generate description route error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}

function safeParseJson(content: string): Record<string, unknown> | null {
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function buildTextFallback(content: string, body: GenerateDescriptionRequest) {
  return {
    title: `${body.projectType} Project Description`,
    summary: content || 'Professional project description generated successfully.',
    scopeOfWork: [body.scope],
    assumptions: ['Final dimensions and material quantities will be verified on-site.'],
    risksAndConsiderations: ['Permit requirements and code constraints may impact scope and schedule.'],
    recommendedNextSteps: ['Schedule site visit', 'Finalize estimate', 'Confirm schedule and permits'],
  };
}

function buildMockDescription(body: GenerateDescriptionRequest) {
  const locationText = body.location
    ? `${body.location.city || ''} ${body.location.state || ''}`.trim()
    : 'project location';

  return {
    title: `${body.projectType} Scope - ${locationText || 'Local Project'}`,
    summary:
      `This ${body.projectType.toLowerCase()} project includes ${body.scope}. ` +
      `The work will be completed using industry-standard methods, code-compliant materials, and a phased execution plan aligned with homeowner priorities.`,
    scopeOfWork: [
      `Prepare job site and protect adjacent finishes for ${body.projectType.toLowerCase()} work`,
      body.scope,
      'Complete quality control walkthrough and deliver closeout checklist',
    ],
    assumptions: [
      'Existing conditions are suitable for standard installation methods.',
      'Required utilities and site access will be available during work hours.',
      body.timeline ? `Target timeline is ${body.timeline}.` : 'Timeline will be finalized after scope confirmation.',
    ],
    risksAndConsiderations: [
      'Material lead times may affect schedule.',
      'Permit and inspection requirements vary by jurisdiction.',
      body.budget ? `Current budget target is approximately $${body.budget.toLocaleString()}.` : 'Budget target is pending confirmation.',
    ],
    recommendedNextSteps: [
      'Schedule a site walk to confirm dimensions and existing conditions.',
      'Finalize line-item estimate and payment milestones.',
      'Submit permit documents if required before mobilization.',
    ],
  };
}
