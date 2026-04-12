import { NextResponse } from 'next/server';
import { getVisibleSuppliersForViewer } from '../../../../../backend/lib/server/authStore';

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const viewerType = (searchParams.get('viewerType') || '').trim();

    if (!viewerType) {
      return NextResponse.json({ success: false, error: 'viewerType is required' }, { status: 400 });
    }

    const suppliers = await getVisibleSuppliersForViewer(viewerType);
    return NextResponse.json({ success: true, suppliers });
  } catch (error) {
    console.error('Supplier directory error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load suppliers' }, { status: 500 });
  }
}
