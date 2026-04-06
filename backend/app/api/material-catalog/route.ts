import { NextRequest, NextResponse } from 'next/server';
import {
  generateMonthlyCatalogSnapshot,
  listLatestMaterialCatalog,
} from '../../../lib/services/materialCatalogService';

export async function GET(request: NextRequest) {
  try {
    const state = request.nextUrl.searchParams.get('state') || undefined;
    const city = request.nextUrl.searchParams.get('city') || undefined;
    const materialName = request.nextUrl.searchParams.get('materialName') || undefined;
    const limitParam = Number(request.nextUrl.searchParams.get('limit'));
    const limit = Number.isFinite(limitParam) ? limitParam : undefined;

    const catalog = await listLatestMaterialCatalog({ state, city, materialName, limit });
    return NextResponse.json({
      success: true,
      catalog,
    });
  } catch (error) {
    console.error('Material catalog list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list material catalog' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const year = Number(body.year);
    const month = Number(body.month);

    const result = await generateMonthlyCatalogSnapshot({
      year: Number.isFinite(year) ? year : undefined,
      month: Number.isFinite(month) ? month : undefined,
      state: typeof body.state === 'string' ? body.state : undefined,
      city: typeof body.city === 'string' ? body.city : undefined,
    });

    return NextResponse.json({
      success: true,
      snapshotCount: result.snapshotCount,
      snapshots: result.snapshots,
      note: 'Use this endpoint with a monthly cron job to refresh the catalog.',
    });
  } catch (error) {
    console.error('Material catalog monthly update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update material catalog snapshot' },
      { status: 500 }
    );
  }
}
