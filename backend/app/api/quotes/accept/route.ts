import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sendEstimateAcceptedEmail } from '../../../../lib/email';
import { dbQuery, isDatabaseEnabled } from '../../../../lib/db';

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

interface AcceptEstimateRequest {
  estimateId: string;
  userId: string;
  projectId: string;
}

/**
 * POST /api/quotes/accept
 * Accept an estimate and create a project agreement
 */
export async function POST(request: NextRequest) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data: AcceptEstimateRequest = await request.json();
    const { estimateId, userId, projectId } = data;

    if (!estimateId || !userId || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: user mismatch' },
        { status: 403 }
      );
    }

    if (!isDatabaseEnabled()) {
      return NextResponse.json(
        { success: false, error: 'Quotes database is not configured' },
        { status: 503 }
      );
    }

    type EstimateRow = {
      id: string;
      project_id: string | null;
      homeowner_id: string | null;
      contractor_id: string | null;
      amount: number | null;
      status: string | null;
    };

    const estimates = await dbQuery<EstimateRow>(
      `SELECT id, project_id, homeowner_id, contractor_id, amount, status
       FROM estimates
       WHERE id = $1
         AND project_id = $2
         AND homeowner_id = $3
       LIMIT 1`,
      [estimateId, projectId, userId]
    );

    if (estimates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Estimate not found for this user/project' },
        { status: 404 }
      );
    }

    const estimate = estimates[0];
    if (!estimate.contractor_id) {
      return NextResponse.json(
        { success: false, error: 'Estimate has no contractor assigned' },
        { status: 400 }
      );
    }

    if (estimate.status === 'accepted') {
      return NextResponse.json(
        { success: true, message: 'Estimate already accepted' },
        { status: 200 }
      );
    }

    await dbQuery(
      `UPDATE estimates
       SET status = 'accepted', updated_at = NOW()
       WHERE id = $1`,
      [estimateId]
    );

    await dbQuery(
      `UPDATE estimates
       SET status = 'rejected', updated_at = NOW()
       WHERE project_id = $1
         AND id <> $2
         AND status = 'pending'`,
      [projectId, estimateId]
    );

    type UserRow = { id: string; first_name: string | null; last_name: string | null; email: string | null };
    const users = await dbQuery<UserRow>(
      'SELECT id, first_name, last_name, email FROM users WHERE id = ANY($1::text[])',
      [[userId, estimate.contractor_id]]
    );

    const homeowner = users.find((u) => u.id === userId);
    const contractor = users.find((u) => u.id === estimate.contractor_id);

    const homeownerName = homeowner ? `${homeowner.first_name || ''} ${homeowner.last_name || ''}`.trim() || userId : userId;
    const contractorName = contractor ? `${contractor.first_name || ''} ${contractor.last_name || ''}`.trim() || estimate.contractor_id : estimate.contractor_id;

    const agreement = {
      id: 'agr_' + Date.now(),
      estimateId,
      projectId,
      userId,
      contractorId: estimate.contractor_id,
      status: 'active',
      acceptedAt: new Date().toISOString(),
      startDate: new Date().toISOString(),
      expectedCompletionDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Send notification email to contractor
    if (contractor?.email) {
      const emailResult = await sendEstimateAcceptedEmail(
        contractor.email,
        contractorName,
        homeownerName,
        `Project ${projectId}`,
        Number(estimate.amount || 0)
      );

      if (!emailResult.success) {
        console.error('Failed to send acceptance email to contractor');
      }
    }

    return NextResponse.json({
      success: true,
      agreement,
      message: 'Estimate accepted successfully',
    });
  } catch (error) {
    console.error('Accept estimate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to accept estimate' },
      { status: 500 }
    );
  }
}
