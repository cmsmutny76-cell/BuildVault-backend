import { dbQuery, isDatabaseEnabled } from '../db';

type LocationInput = {
  city?: string;
  state?: string;
  zipCode?: string;
};

type QuoteMaterialInput = {
  name?: string;
  unit?: string;
  quantity?: string | number;
  prices?: Array<{
    retailer?: string;
    price?: number | string;
  }>;
};

export type CatalogObservation = {
  id: string;
  projectId?: string;
  source: string;
  projectType?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  materialName: string;
  materialUnit?: string;
  requestedQuantity?: string;
  retailer: string;
  price: number;
  currency: string;
  observedAt: string;
  createdAt: string;
};

export type CatalogSnapshotRow = {
  id: string;
  snapshotMonth: string;
  state?: string;
  city?: string;
  materialName: string;
  materialUnit?: string;
  retailer: string;
  sampleCount: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  latestObservedAt?: string;
  createdAt: string;
};

export type CatalogPriceHint = {
  materialName: string;
  retailer: string;
  avgPrice: number;
  sampleCount: number;
  latestObservedAt?: string;
  snapshotMonth: string;
};

type ObservationDbRow = {
  id: string;
  project_id: string | null;
  source: string;
  project_type: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  material_name: string;
  material_unit: string | null;
  requested_quantity: string | null;
  retailer: string;
  price: string | number;
  currency: string;
  observed_at: Date;
  created_at: Date;
};

type SnapshotDbRow = {
  id: string;
  snapshot_month: Date;
  state: string | null;
  city: string | null;
  material_name: string;
  material_unit: string | null;
  retailer: string;
  sample_count: number;
  avg_price: string | number;
  min_price: string | number;
  max_price: string | number;
  latest_observed_at: Date | null;
  created_at: Date;
};

const observationFallback = new Map<string, CatalogObservation>();
const snapshotFallback = new Map<string, CatalogSnapshotRow>();
let tablesEnsured = false;

function toIsoDate(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  return new Date(value).toISOString();
}

function mapObservationRow(row: ObservationDbRow): CatalogObservation {
  return {
    id: row.id,
    projectId: row.project_id || undefined,
    source: row.source,
    projectType: row.project_type || undefined,
    city: row.city || undefined,
    state: row.state || undefined,
    zipCode: row.zip_code || undefined,
    materialName: row.material_name,
    materialUnit: row.material_unit || undefined,
    requestedQuantity: row.requested_quantity || undefined,
    retailer: row.retailer,
    price: Number(row.price),
    currency: row.currency,
    observedAt: new Date(row.observed_at).toISOString(),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function mapSnapshotRow(row: SnapshotDbRow): CatalogSnapshotRow {
  return {
    id: row.id,
    snapshotMonth: new Date(row.snapshot_month).toISOString(),
    state: row.state || undefined,
    city: row.city || undefined,
    materialName: row.material_name,
    materialUnit: row.material_unit || undefined,
    retailer: row.retailer,
    sampleCount: Number(row.sample_count),
    avgPrice: Number(row.avg_price),
    minPrice: Number(row.min_price),
    maxPrice: Number(row.max_price),
    latestObservedAt: toIsoDate(row.latest_observed_at),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

async function ensureCatalogTables() {
  if (!isDatabaseEnabled() || tablesEnsured) {
    return;
  }

  await dbQuery(`CREATE TABLE IF NOT EXISTS app_material_search_observations (
    id TEXT PRIMARY KEY,
    project_id TEXT NULL,
    source TEXT NOT NULL,
    project_type TEXT NULL,
    city TEXT NULL,
    state TEXT NULL,
    zip_code TEXT NULL,
    material_name TEXT NOT NULL,
    material_unit TEXT NULL,
    requested_quantity TEXT NULL,
    retailer TEXT NOT NULL,
    price NUMERIC(12, 4) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    observed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
  )`);

  await dbQuery(`CREATE INDEX IF NOT EXISTS idx_material_observations_location_time ON app_material_search_observations(state, city, observed_at DESC)`);
  await dbQuery(`CREATE INDEX IF NOT EXISTS idx_material_observations_material ON app_material_search_observations(material_name, retailer)`);

  await dbQuery(`CREATE TABLE IF NOT EXISTS app_material_catalog_monthly (
    id TEXT PRIMARY KEY,
    snapshot_month DATE NOT NULL,
    state TEXT NULL,
    city TEXT NULL,
    material_name TEXT NOT NULL,
    material_unit TEXT NULL,
    retailer TEXT NOT NULL,
    sample_count INTEGER NOT NULL,
    avg_price NUMERIC(12, 4) NOT NULL,
    min_price NUMERIC(12, 4) NOT NULL,
    max_price NUMERIC(12, 4) NOT NULL,
    latest_observed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL
  )`);

  await dbQuery(`CREATE INDEX IF NOT EXISTS idx_material_catalog_monthly_lookup ON app_material_catalog_monthly(snapshot_month DESC, state, city, material_name, retailer)`);

  tablesEnsured = true;
}

function normalizeState(state?: string): string | undefined {
  return state ? state.trim().toUpperCase() : undefined;
}

function normalizeCity(city?: string): string | undefined {
  return city ? city.trim() : undefined;
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function recordMaterialSearchObservations(input: {
  projectId?: string;
  source: string;
  projectType?: string;
  location?: LocationInput;
  materials?: QuoteMaterialInput[];
}) {
  const rows: CatalogObservation[] = [];
  const state = normalizeState(input.location?.state);
  const city = normalizeCity(input.location?.city);

  const materials = Array.isArray(input.materials) ? input.materials : [];
  for (const material of materials) {
    const materialName = String(material?.name || '').trim();
    if (!materialName) {
      continue;
    }

    const prices = Array.isArray(material.prices) ? material.prices : [];
    for (const priceRow of prices) {
      const retailer = String(priceRow?.retailer || '').trim();
      const rawPrice = Number(priceRow?.price);
      if (!retailer || !Number.isFinite(rawPrice) || rawPrice <= 0) {
        continue;
      }

      const now = new Date().toISOString();
      rows.push({
        id: createId('matobs'),
        projectId: input.projectId,
        source: input.source,
        projectType: input.projectType,
        city,
        state,
        zipCode: input.location?.zipCode,
        materialName,
        materialUnit: material.unit ? String(material.unit) : undefined,
        requestedQuantity: material.quantity !== undefined ? String(material.quantity) : undefined,
        retailer,
        price: rawPrice,
        currency: 'USD',
        observedAt: now,
        createdAt: now,
      });
    }
  }

  if (rows.length === 0) {
    return { success: true, recorded: 0 };
  }

  if (!isDatabaseEnabled()) {
    rows.forEach((row) => observationFallback.set(row.id, row));
    return { success: true, recorded: rows.length };
  }

  try {
    await ensureCatalogTables();
    for (const row of rows) {
      await dbQuery(
        `INSERT INTO app_material_search_observations (
          id, project_id, source, project_type, city, state, zip_code,
          material_name, material_unit, requested_quantity,
          retailer, price, currency, observed_at, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10,
          $11, $12, $13, $14, $15
        )`,
        [
          row.id,
          row.projectId || null,
          row.source,
          row.projectType || null,
          row.city || null,
          row.state || null,
          row.zipCode || null,
          row.materialName,
          row.materialUnit || null,
          row.requestedQuantity || null,
          row.retailer,
          row.price,
          row.currency,
          row.observedAt,
          row.createdAt,
        ]
      );
    }

    return { success: true, recorded: rows.length };
  } catch {
    rows.forEach((row) => observationFallback.set(row.id, row));
    return { success: true, recorded: rows.length };
  }
}

function getMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
}

export async function generateMonthlyCatalogSnapshot(input?: {
  year?: number;
  month?: number;
  state?: string;
  city?: string;
}) {
  const now = new Date();
  const year = input?.year || now.getUTCFullYear();
  const month = input?.month || now.getUTCMonth() + 1;
  const { start, end } = getMonthRange(year, month);
  const state = normalizeState(input?.state);
  const city = normalizeCity(input?.city);

  if (!isDatabaseEnabled()) {
    const observations = Array.from(observationFallback.values()).filter((row) => {
      const observed = new Date(row.observedAt);
      if (observed < start || observed >= end) return false;
      if (state && row.state !== state) return false;
      if (city && row.city !== city) return false;
      return true;
    });

    const grouped = new Map<string, CatalogSnapshotRow>();
    for (const row of observations) {
      const key = `${year}-${month}|${row.state || ''}|${row.city || ''}|${row.materialName}|${row.materialUnit || ''}|${row.retailer}`;
      const current = grouped.get(key);
      if (!current) {
        grouped.set(key, {
          id: createId('matcat'),
          snapshotMonth: start.toISOString(),
          state: row.state,
          city: row.city,
          materialName: row.materialName,
          materialUnit: row.materialUnit,
          retailer: row.retailer,
          sampleCount: 1,
          avgPrice: row.price,
          minPrice: row.price,
          maxPrice: row.price,
          latestObservedAt: row.observedAt,
          createdAt: new Date().toISOString(),
        });
      } else {
        const count = current.sampleCount + 1;
        current.avgPrice = (current.avgPrice * current.sampleCount + row.price) / count;
        current.sampleCount = count;
        current.minPrice = Math.min(current.minPrice, row.price);
        current.maxPrice = Math.max(current.maxPrice, row.price);
        if (!current.latestObservedAt || new Date(row.observedAt) > new Date(current.latestObservedAt)) {
          current.latestObservedAt = row.observedAt;
        }
      }
    }

    const snapshots = Array.from(grouped.values());
    snapshots.forEach((row) => snapshotFallback.set(row.id, row));
    return { success: true, snapshotCount: snapshots.length, snapshots };
  }

  await ensureCatalogTables();

  const params: unknown[] = [start.toISOString(), end.toISOString()];
  let where = 'observed_at >= $1 AND observed_at < $2';

  if (state) {
    params.push(state);
    where += ` AND state = $${params.length}`;
  }
  if (city) {
    params.push(city);
    where += ` AND city = $${params.length}`;
  }

  const aggregateRows = await dbQuery<{
    state: string | null;
    city: string | null;
    material_name: string;
    material_unit: string | null;
    retailer: string;
    sample_count: number;
    avg_price: string | number;
    min_price: string | number;
    max_price: string | number;
    latest_observed_at: Date | null;
  }>(
    `SELECT
      state,
      city,
      material_name,
      material_unit,
      retailer,
      COUNT(*)::int AS sample_count,
      AVG(price) AS avg_price,
      MIN(price) AS min_price,
      MAX(price) AS max_price,
      MAX(observed_at) AS latest_observed_at
     FROM app_material_search_observations
     WHERE ${where}
     GROUP BY state, city, material_name, material_unit, retailer`,
    params
  );

  const snapshots: CatalogSnapshotRow[] = [];
  for (const row of aggregateRows) {
    const snapshot: CatalogSnapshotRow = {
      id: createId('matcat'),
      snapshotMonth: start.toISOString(),
      state: row.state || undefined,
      city: row.city || undefined,
      materialName: row.material_name,
      materialUnit: row.material_unit || undefined,
      retailer: row.retailer,
      sampleCount: Number(row.sample_count),
      avgPrice: Number(row.avg_price),
      minPrice: Number(row.min_price),
      maxPrice: Number(row.max_price),
      latestObservedAt: toIsoDate(row.latest_observed_at),
      createdAt: new Date().toISOString(),
    };

    await dbQuery(
      `INSERT INTO app_material_catalog_monthly (
        id, snapshot_month, state, city,
        material_name, material_unit, retailer,
        sample_count, avg_price, min_price, max_price,
        latest_observed_at, created_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13
      )`,
      [
        snapshot.id,
        start.toISOString().slice(0, 10),
        snapshot.state || null,
        snapshot.city || null,
        snapshot.materialName,
        snapshot.materialUnit || null,
        snapshot.retailer,
        snapshot.sampleCount,
        snapshot.avgPrice,
        snapshot.minPrice,
        snapshot.maxPrice,
        snapshot.latestObservedAt || null,
        snapshot.createdAt,
      ]
    );

    snapshots.push(snapshot);
  }

  return { success: true, snapshotCount: snapshots.length, snapshots };
}

export async function listLatestMaterialCatalog(input?: {
  state?: string;
  city?: string;
  materialName?: string;
  limit?: number;
}) {
  const state = normalizeState(input?.state);
  const city = normalizeCity(input?.city);
  const materialName = input?.materialName?.trim();
  const limit = Math.max(1, Math.min(input?.limit || 100, 500));

  if (!isDatabaseEnabled()) {
    let rows = Array.from(snapshotFallback.values());
    if (state) rows = rows.filter((row) => row.state === state);
    if (city) rows = rows.filter((row) => row.city === city);
    if (materialName) rows = rows.filter((row) => row.materialName.toLowerCase().includes(materialName.toLowerCase()));
    rows.sort((a, b) => new Date(b.snapshotMonth).getTime() - new Date(a.snapshotMonth).getTime());
    return rows.slice(0, limit);
  }

  await ensureCatalogTables();

  const params: unknown[] = [];
  const whereParts: string[] = [];
  if (state) {
    params.push(state);
    whereParts.push(`state = $${params.length}`);
  }
  if (city) {
    params.push(city);
    whereParts.push(`city = $${params.length}`);
  }
  if (materialName) {
    params.push(`%${materialName}%`);
    whereParts.push(`material_name ILIKE $${params.length}`);
  }
  params.push(limit);

  const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
  const rows = await dbQuery<SnapshotDbRow>(
    `SELECT * FROM app_material_catalog_monthly
     ${whereClause}
     ORDER BY snapshot_month DESC, sample_count DESC
     LIMIT $${params.length}`,
    params
  );

  return rows.map(mapSnapshotRow);
}

export async function getLatestCatalogPriceHints(input: {
  state?: string;
  city?: string;
  materialNames: string[];
  limitPerMaterial?: number;
}): Promise<Record<string, CatalogPriceHint[]>> {
  const state = normalizeState(input.state);
  const city = normalizeCity(input.city);
  const limitPerMaterial = Math.max(1, Math.min(input.limitPerMaterial || 4, 10));
  const normalizedNames = [...new Set((input.materialNames || [])
    .map((name) => String(name || '').trim().toLowerCase())
    .filter(Boolean))];

  if (!normalizedNames.length) {
    return {};
  }

  const appendHint = (
    store: Record<string, CatalogPriceHint[]>,
    key: string,
    hint: CatalogPriceHint
  ) => {
    const bucket = store[key] || [];
    const existingRetailer = bucket.find((row) => row.retailer.toLowerCase() === hint.retailer.toLowerCase());
    if (existingRetailer) {
      return;
    }
    if (bucket.length >= limitPerMaterial) {
      return;
    }
    bucket.push(hint);
    store[key] = bucket;
  };

  if (!isDatabaseEnabled()) {
    const rows = Array.from(snapshotFallback.values())
      .filter((row) => {
        const rowName = row.materialName.trim().toLowerCase();
        if (!normalizedNames.includes(rowName)) return false;
        if (state && row.state !== state) return false;
        if (city && row.city !== city) return false;
        return true;
      })
      .sort((a, b) => {
        const monthDelta = new Date(b.snapshotMonth).getTime() - new Date(a.snapshotMonth).getTime();
        if (monthDelta !== 0) return monthDelta;
        return b.sampleCount - a.sampleCount;
      });

    const result: Record<string, CatalogPriceHint[]> = {};
    for (const row of rows) {
      const key = row.materialName.trim().toLowerCase();
      appendHint(result, key, {
        materialName: row.materialName,
        retailer: row.retailer,
        avgPrice: row.avgPrice,
        sampleCount: row.sampleCount,
        latestObservedAt: row.latestObservedAt,
        snapshotMonth: row.snapshotMonth,
      });
    }

    return result;
  }

  await ensureCatalogTables();

  const params: unknown[] = [normalizedNames];
  const whereParts = ['LOWER(material_name) = ANY($1::text[])'];

  if (state) {
    params.push(state);
    whereParts.push(`state = $${params.length}`);
  }
  if (city) {
    params.push(city);
    whereParts.push(`city = $${params.length}`);
  }

  const rows = await dbQuery<SnapshotDbRow>(
    `SELECT * FROM app_material_catalog_monthly
     WHERE ${whereParts.join(' AND ')}
     ORDER BY snapshot_month DESC, sample_count DESC`,
    params
  );

  const result: Record<string, CatalogPriceHint[]> = {};
  for (const row of rows) {
    const materialKey = row.material_name.trim().toLowerCase();
    appendHint(result, materialKey, {
      materialName: row.material_name,
      retailer: row.retailer,
      avgPrice: Number(row.avg_price),
      sampleCount: Number(row.sample_count),
      latestObservedAt: toIsoDate(row.latest_observed_at),
      snapshotMonth: new Date(row.snapshot_month).toISOString(),
    });
  }

  return result;
}
