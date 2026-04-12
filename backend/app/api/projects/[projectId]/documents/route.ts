import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  listProjectDocuments,
  saveProjectDocument,
  type ProjectDocumentType,
} from '../../../../../lib/services/projectDocumentService';
import { getProjectById } from '../../../../../lib/services/projectService';

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

function toTextValue(value: unknown): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None';
    return value.map((item) => `- ${toTextValue(item)}`).join('\n');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) return 'None';
    return entries
      .map(([key, entryValue]) => `${key}: ${typeof entryValue === 'object' ? '\n' + toTextValue(entryValue) : toTextValue(entryValue)}`)
      .join('\n');
  }
  return String(value);
}

function buildLegacyDocumentReportText(document: any): string | null {
  const data = document?.data;
  if (!data || typeof data !== 'object') {
    return null;
  }

  if (typeof (data as any).reportText === 'string' && (data as any).reportText.trim()) {
    return (data as any).reportText;
  }

  const lines: string[] = [];
  lines.push(String(document?.title || 'Project Report').toUpperCase());
  lines.push(`Type: ${document?.type || 'unknown'}`);
  lines.push(`Created: ${document?.createdAt || 'unknown'}`);
  lines.push('');

  if ((data as any).analysis) {
    lines.push('Analysis:');
    lines.push(toTextValue((data as any).analysis));
    lines.push('');
  }

  if ((data as any).blueprint) {
    lines.push('Blueprint:');
    lines.push(toTextValue((data as any).blueprint));
    lines.push('');
  }

  if ((data as any).materialQuote) {
    lines.push('Material Quote:');
    lines.push(toTextValue((data as any).materialQuote));
    lines.push('');
  }

  if ((data as any).buildingCodes || (data as any).codes) {
    lines.push('Building Codes:');
    lines.push(toTextValue((data as any).buildingCodes || (data as any).codes));
    lines.push('');
  }

  if ((data as any).agencies) {
    lines.push('Agencies:');
    lines.push(toTextValue((data as any).agencies));
    lines.push('');
  }

  if ((data as any).rawAnalysis) {
    lines.push('Raw Analysis:');
    lines.push(String((data as any).rawAnalysis));
    lines.push('');
  }

  if (lines.length <= 4) {
    lines.push('Details:');
    lines.push(toTextValue(data));
  }

  return lines.join('\n').trim();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request);
    if (!authenticatedUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    const type = request.nextUrl.searchParams.get('type') as ProjectDocumentType | null;

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const documents = await listProjectDocuments(projectId, type || undefined);
    const normalizedDocuments = documents.map((document) => {
      const fallbackText = buildLegacyDocumentReportText(document);
      if (!fallbackText) {
        return document;
      }

      return {
        ...document,
        data: {
          ...document.data,
          reportText: fallbackText,
        },
      };
    });

    return NextResponse.json({
      success: true,
      projectId,
      documents: normalizedDocuments,
    });
  } catch (error) {
    console.error('List project documents error:', error);
    return NextResponse.json({ success: false, error: 'Failed to list project documents' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request);
    if (!authenticatedUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await request.json();

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    if (!body?.type || !body?.title || !body?.data) {
      return NextResponse.json(
        { success: false, error: 'type, title, and data are required' },
        { status: 400 }
      );
    }

    if (body.userId && body.userId !== authenticatedUserId) {
      return NextResponse.json({ success: false, error: 'Forbidden: user mismatch' }, { status: 403 });
    }

    const document = await saveProjectDocument({
      projectId,
      createdByUserId: authenticatedUserId,
      type: body.type,
      title: body.title,
      data: body.data,
      tags: Array.isArray(body.tags) ? body.tags : [],
    });

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Save project document error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save project document' }, { status: 500 });
  }
}
