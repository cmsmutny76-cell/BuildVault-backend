import {
  type EstimateLineItem,
  type EstimateLineItemInput,
  type EstimateRecord,
} from '../domain/estimate';
import { dbQuery, isDatabaseEnabled } from '../db';
import { logPlatformEvent } from '../eventLogger';

export interface MaterialRequest {
  name: string;
  quantity: string;
  unit: string;
}

export interface MaterialQuoteRequest {
  materials: MaterialRequest[];
  projectType?: string;
  zipCode?: string;
}

const estimateStore = new Map<string, EstimateRecord[]>();

interface EstimateRow {
  id: string;
  project_id: string;
  contractor_id: string;
  project_title: string;
  status: EstimateRecord['status'];
  line_items: EstimateLineItem[];
  subtotal: string | number;
  tax: string | number;
  total: string | number;
  notes: string | null;
  valid_until: Date;
  created_at: Date;
}

function mapEstimateRow(row: EstimateRow): EstimateRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    contractorId: row.contractor_id,
    projectTitle: row.project_title,
    status: row.status,
    lineItems: row.line_items,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    total: Number(row.total),
    notes: row.notes || undefined,
    validUntil: new Date(row.valid_until).toISOString(),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function listProjectEstimates(projectId: string): Promise<EstimateRecord[]> {
  if (!isDatabaseEnabled()) {
    return estimateStore.get(projectId) || [];
  }

  const rows = await dbQuery<EstimateRow>('SELECT * FROM app_estimates WHERE project_id = $1 ORDER BY created_at DESC', [projectId]);
  return rows.map(mapEstimateRow);
}

export async function getEstimateById(estimateId: string): Promise<EstimateRecord | null> {
  if (isDatabaseEnabled()) {
    const rows = await dbQuery<EstimateRow>('SELECT * FROM app_estimates WHERE id = $1 LIMIT 1', [estimateId]);
    return rows[0] ? mapEstimateRow(rows[0]) : null;
  }

  for (const estimates of estimateStore.values()) {
    const match = estimates.find((estimate) => estimate.id === estimateId);
    if (match) {
      return match;
    }
  }

  return null;
}

export async function createEstimate(input: {
  projectId: string;
  contractorId: string;
  projectTitle: string;
  lineItems: EstimateLineItemInput[];
  notes?: string;
  validDays?: number;
}): Promise<EstimateRecord> {
  const { projectId, contractorId, projectTitle, lineItems, notes, validDays = 30 } = input;

  const normalizedLineItems: EstimateLineItem[] = lineItems.map((item, index) => ({
    id: `li_${Date.now()}_${index}`,
    ...item,
    total: Number(item.quantity) * Number(item.unitPrice),
  }));

  const subtotal = normalizedLineItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  const estimate: EstimateRecord = {
    id: `est_${Date.now()}`,
    projectId,
    contractorId,
    projectTitle,
    status: 'sent',
    lineItems: normalizedLineItems,
    subtotal,
    tax,
    total,
    notes,
    validUntil: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  if (isDatabaseEnabled()) {
    await dbQuery(
      `INSERT INTO app_estimates (id, project_id, contractor_id, project_title, status, line_items, subtotal, tax, total, notes, valid_until, created_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12)`,
      [
        estimate.id,
        estimate.projectId,
        estimate.contractorId,
        estimate.projectTitle,
        estimate.status,
        JSON.stringify(estimate.lineItems),
        estimate.subtotal,
        estimate.tax,
        estimate.total,
        estimate.notes || null,
        estimate.validUntil,
        estimate.createdAt,
      ]
    );
  } else {
    const existing = estimateStore.get(projectId) || [];
    estimateStore.set(projectId, [estimate, ...existing]);
  }

  logPlatformEvent({
    type: 'estimate_created',
    entityType: 'estimate',
    entityId: estimate.id,
    metadata: {
      projectId,
      contractorId,
      projectTitle,
      lineItemCount: normalizedLineItems.length,
      total,
    },
  });

  return estimate;
}

export function generateMaterialQuote(input: MaterialQuoteRequest) {
  const quotedMaterials = input.materials.map((material) => {
    const basePrice = Math.random() * 100 + 20;

    return {
      ...material,
      prices: [
        {
          retailer: 'Home Depot',
          price: basePrice,
          url: 'https://www.homedepot.com/search?q=' + encodeURIComponent(material.name),
          inStock: true,
        },
        {
          retailer: 'Lowes',
          price: basePrice * 0.95,
          url: 'https://www.lowes.com/search?searchTerm=' + encodeURIComponent(material.name),
          inStock: true,
        },
        {
          retailer: 'Ace Hardware',
          price: basePrice * 1.05,
          url: 'https://www.acehardware.com/search?query=' + encodeURIComponent(material.name),
          inStock: Math.random() > 0.3,
        },
      ],
      bestPrice: basePrice * 0.95,
      bestRetailer: 'Lowes',
    };
  });

  const totalCost = quotedMaterials.reduce((sum, item) => sum + item.bestPrice, 0);

  const quote = {
    id: Date.now(),
    projectType: input.projectType,
    zipCode: input.zipCode,
    materials: quotedMaterials,
    totalCost: totalCost.toFixed(2),
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Prices are estimates and may vary. Please verify current pricing with retailers.',
  };

  logPlatformEvent({
    type: 'material_quote_generated',
    entityType: 'estimate',
    entityId: String(quote.id),
    metadata: {
      projectType: input.projectType,
      zipCode: input.zipCode,
      materialCount: input.materials.length,
      totalCost: quote.totalCost,
    },
  });

  return quote;
}
