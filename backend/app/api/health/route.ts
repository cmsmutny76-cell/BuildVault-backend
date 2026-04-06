import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      service: 'buildvault-backend',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
