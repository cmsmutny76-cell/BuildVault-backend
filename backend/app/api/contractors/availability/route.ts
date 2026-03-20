import { NextRequest, NextResponse } from 'next/server';
import {
  ContractorAvailability,
  getAllAvailabilityOverrides,
  setContractorAvailability,
} from '../../../../lib/services/contractorAvailabilityService';

/**
 * GET /api/contractors/availability
 * Returns all current availability overrides.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    overrides: await getAllAvailabilityOverrides(),
  });
}

/**
 * POST /api/contractors/availability
 * Set availability for a contractor.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractorId, availability } = body as {
      contractorId?: string;
      availability?: ContractorAvailability;
    };

    if (!contractorId || !availability) {
      return NextResponse.json(
        { success: false, error: 'contractorId and availability are required' },
        { status: 400 }
      );
    }

    if (!['available', 'busy', 'booked'].includes(availability)) {
      return NextResponse.json(
        { success: false, error: 'availability must be one of: available, busy, booked' },
        { status: 400 }
      );
    }

    await setContractorAvailability(contractorId, availability);

    return NextResponse.json({
      success: true,
      contractorId,
      availability,
      overrides: await getAllAvailabilityOverrides(),
    });
  } catch (error) {
    console.error('Set contractor availability error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set availability' },
      { status: 500 }
    );
  }
}
