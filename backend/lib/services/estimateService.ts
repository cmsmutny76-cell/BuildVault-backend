import {
  type EstimateLineItem,
  type EstimateLineItemInput,
  type EstimateRecord,
} from '../domain/estimate';
import { dbQuery, isDatabaseEnabled } from '../db';
import { logPlatformEvent } from '../eventLogger';
import { getLatestCatalogPriceHints } from './materialCatalogService';

export interface MaterialRequest {
  name: string;
  quantity: string;
  unit: string;
}

export interface MaterialQuoteRequest {
  materials: MaterialRequest[];
  projectType?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  comparisonStores?: string[];
}

function normalizeText(value?: string) {
  return String(value || '').trim().toLowerCase();
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function classifyMaterial(name: string) {
  const normalizedName = normalizeText(name);
  if (/(hanger|tie|bracket|anchor|connector|strap|bolt|screw|nail plate|fastener)/.test(normalizedName)) return 'hardware';
  if (/(lumber|stud|joist|rafter|beam|plywood|osb|framing)/.test(normalizedName)) return 'framing';
  if (/(drywall|sheetrock|compound|mud|joint tape)/.test(normalizedName)) return 'drywall';
  if (/(floor|tile|vinyl|laminate|hardwood|underlayment)/.test(normalizedName)) return 'flooring';
  if (/(outlet|switch|breaker|wire|romex|electrical|afci|gfci)/.test(normalizedName)) return 'electrical';
  if (/(pipe|valve|fixture|faucet|plumbing)/.test(normalizedName)) return 'plumbing';
  if (/(insulation|batt|rigid foam|spray foam|vapor barrier)/.test(normalizedName)) return 'insulation';
  if (/(roof|shingle|flashing|felt)/.test(normalizedName)) return 'roofing';
  return 'general';
}

function getCategoryBaseline(category: string): number {
  const baselines: Record<string, number> = {
    hardware: 14,
    framing: 38,
    drywall: 24,
    flooring: 62,
    electrical: 29,
    plumbing: 34,
    insulation: 27,
    roofing: 49,
    general: 31,
  };
  return baselines[category] ?? baselines.general;
}

function getRegionalMultiplier(input: { state?: string; city?: string }): number {
  const stateCode = String(input.state || '').toUpperCase();
  const stateMultiplier: Record<string, number> = {
    CA: 1.18,
    NY: 1.16,
    WA: 1.12,
    OR: 1.1,
    FL: 1.08,
    TX: 1.04,
    AZ: 1.05,
    CO: 1.07,
    IL: 1.06,
    GA: 1.03,
    NC: 1.02,
  };

  const cityPremium = (() => {
    const normalizedCity = normalizeText(input.city);
    if (!normalizedCity) return 1;
    if (/(san francisco|new york|seattle|los angeles|boston|miami)/.test(normalizedCity)) return 1.06;
    if (/(austin|denver|portland|chicago|atlanta|phoenix)/.test(normalizedCity)) return 1.03;
    return 1;
  })();

  return (stateMultiplier[stateCode] ?? 1) * cityPremium;
}

function deterministicInStock(seed: string, threshold = 0.2): boolean {
  const value = (hashString(seed) % 1000) / 1000;
  return value >= threshold;
}

function buildDeterministicBasePrice(input: { materialName: string; city?: string; state?: string; projectType?: string }): number {
  const category = classifyMaterial(input.materialName);
  const baseline = getCategoryBaseline(category);
  const regionMultiplier = getRegionalMultiplier({ state: input.state, city: input.city });
  const materialVariance = 0.9 + (hashString(`${normalizeText(input.materialName)}|variance`) % 35) / 100;
  const projectVariance = 0.96 + (hashString(normalizeText(input.projectType) || 'general-project') % 12) / 100;
  const value = baseline * regionMultiplier * materialVariance * projectVariance;
  return Number(Math.max(6, value).toFixed(2));
}

function buildRetailerPrice(basePrice: number, retailerName: string, seedKey: string): number {
  const normalizedRetailer = normalizeText(retailerName);
  const retailerMultiplier = (() => {
    if (normalizedRetailer.includes('home depot')) return 1;
    if (normalizedRetailer.includes('lowes')) return 0.98;
    if (normalizedRetailer.includes('hardware')) return 1.02;
    if (normalizedRetailer.includes('building')) return 1.01;
    return 1 + ((hashString(`${normalizedRetailer}|retailer`) % 8) - 4) / 100;
  })();

  const smallVariance = ((hashString(`${seedKey}|${normalizedRetailer}|delta`) % 9) - 4) / 100;
  return Number(Math.max(4, basePrice * retailerMultiplier * (1 + smallVariance)).toFixed(2));
}

function parseQuantityValue(quantity: string): number {
  const normalizedQuantity = String(quantity || '').trim().toLowerCase().replace(/,/g, '');
  if (!normalizedQuantity) {
    return 1;
  }

  const mixedFractionMatch = normalizedQuantity.match(/(\d+)\s+(\d+)\/(\d+)/);
  if (mixedFractionMatch) {
    const whole = Number(mixedFractionMatch[1]);
    const numerator = Number(mixedFractionMatch[2]);
    const denominator = Number(mixedFractionMatch[3]);
    if (denominator > 0) {
      return Number((whole + numerator / denominator).toFixed(2));
    }
  }

  const fractionMatch = normalizedQuantity.match(/\b(\d+)\/(\d+)\b/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (denominator > 0) {
      return Number((numerator / denominator).toFixed(2));
    }
  }

  const rangeMatch = normalizedQuantity.match(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    if (Number.isFinite(start) && Number.isFinite(end)) {
      return Number((((start + end) / 2) || 1).toFixed(2));
    }
  }

  const firstNumberMatch = normalizedQuantity.match(/\d+(?:\.\d+)?/);
  if (!firstNumberMatch) {
    return 1;
  }

  const quantityValue = Number(firstNumberMatch[0]);
  return Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1;
}

function rankRetailersByAveragePrice(materials: Array<{ prices?: Array<{ retailer: string; price: number }> }>): string[] {
  const totals = new Map<string, { total: number; count: number }>();

  for (const material of materials) {
    for (const priceRow of material.prices || []) {
      const retailer = String(priceRow.retailer || '').trim();
      const price = Number(priceRow.price);
      if (!retailer || !Number.isFinite(price)) continue;

      const current = totals.get(retailer) || { total: 0, count: 0 };
      current.total += price;
      current.count += 1;
      totals.set(retailer, current);
    }
  }

  return Array.from(totals.entries())
    .map(([retailer, row]) => ({ retailer, avg: row.total / Math.max(1, row.count) }))
    .sort((a, b) => a.avg - b.avg || a.retailer.localeCompare(b.retailer))
    .map((row) => row.retailer);
}

function getRegionalHardwareStores(input: { city?: string; state?: string; zipCode?: string }) {
  const cityName = input.city || 'Local';
  const stateCode = (input.state || '').toUpperCase();

  const stateSpecific: Record<string, string[]> = {
    TX: ['McCoy\'s Building Supply', 'Sutherlands'],
    CA: ['Ganahl Lumber', 'Anawalt Lumber'],
    FL: ['84 Lumber', 'Florida Lumber'],
    NY: ['Dykes Lumber', 'Kuiken Brothers'],
  };

  const defaults = [`${cityName} Hardware & Supply`, `${cityName} Building Supply`];
  return stateSpecific[stateCode] || defaults;
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
  const localStores = getRegionalHardwareStores({
    city: input.city,
    state: input.state,
    zipCode: input.zipCode,
  });
  const userStores = (input.comparisonStores || []).map((store) => store.trim()).filter(Boolean);
  const dynamicStores = [...new Set([...localStores, ...userStores])];

  const quotedMaterials = input.materials.map((material) => {
    const localStoreName = dynamicStores[0] || 'Local Hardware & Supply';
    const priceSeed = `${normalizeText(material.name)}|${normalizeText(input.city)}|${normalizeText(input.state)}|${normalizeText(input.projectType)}`;
    const basePrice = buildDeterministicBasePrice({
      materialName: material.name,
      city: input.city,
      state: input.state,
      projectType: input.projectType,
    });
    const localPrice = buildRetailerPrice(basePrice, localStoreName, priceSeed);

    const comparisonPrices = dynamicStores.slice(0, 6).map((storeName, index) => {
      const price = buildRetailerPrice(basePrice, storeName, `${priceSeed}|store-index-${index}`);
      return {
        retailer: storeName,
        price,
        url: `https://www.google.com/search?q=${encodeURIComponent(`${storeName} ${input.city || ''} ${input.state || ''} ${material.name}`)}`,
        inStock: deterministicInStock(`${priceSeed}|${storeName}`, 0.18),
      };
    });

    const baseRetailers = [
      {
        retailer: 'Home Depot',
        price: buildRetailerPrice(basePrice, 'Home Depot', priceSeed),
        url: 'https://www.homedepot.com/search?q=' + encodeURIComponent(material.name),
        inStock: deterministicInStock(`${priceSeed}|home-depot`, 0.08),
      },
      {
        retailer: 'Lowes',
        price: buildRetailerPrice(basePrice, 'Lowes', priceSeed),
        url: 'https://www.lowes.com/search?searchTerm=' + encodeURIComponent(material.name),
        inStock: deterministicInStock(`${priceSeed}|lowes`, 0.1),
      },
      {
        retailer: localStoreName,
        price: localPrice,
        url: `https://www.google.com/search?q=${encodeURIComponent(`${localStoreName} ${input.city || ''} ${input.state || ''} ${material.name}`)}`,
        inStock: deterministicInStock(`${priceSeed}|${localStoreName}|local`, 0.22),
      },
    ];

    const prices = [...baseRetailers, ...comparisonPrices].filter(
      (entry, index, list) => list.findIndex((item) => item.retailer === entry.retailer) === index
    );

    const sorted = [...prices].sort((a, b) => a.price - b.price || a.retailer.localeCompare(b.retailer));
    const quantityValue = parseQuantityValue(material.quantity);
    const bestUnitPrice = sorted[0]?.price || basePrice;

    return {
      ...material,
      quantityValue,
      prices: sorted,
      bestPrice: bestUnitPrice,
      bestRetailer: sorted[0]?.retailer || 'Lowes',
      lineTotal: Number((bestUnitPrice * quantityValue).toFixed(2)),
    };
  });

  const totalCost = quotedMaterials.reduce((sum, item: any) => sum + Number(item.lineTotal || 0), 0);

  const rankedRetailers = rankRetailersByAveragePrice(quotedMaterials);

  const quote = {
    id: Date.now(),
    projectType: input.projectType,
    zipCode: input.zipCode,
    city: input.city,
    state: input.state,
    retailersCompared: rankedRetailers.length > 0
      ? rankedRetailers
      : ['Home Depot', 'Lowes', ...dynamicStores],
    primaryRetailers: ['Home Depot', 'Lowes'],
    localRetailers: dynamicStores,
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

export async function generateMaterialQuoteWithCatalog(input: MaterialQuoteRequest) {
  const quote = generateMaterialQuote(input);
  const requestedMaterialNames = (input.materials || [])
    .map((material) => String(material?.name || '').trim())
    .filter(Boolean);

  if (!requestedMaterialNames.length) {
    return quote;
  }

  const hintsByMaterial = await getLatestCatalogPriceHints({
    state: input.state,
    city: input.city,
    materialNames: requestedMaterialNames,
    limitPerMaterial: 5,
  });

  let usedCatalogData = false;
  const mergedMaterials = (quote.materials || []).map((material: any) => {
    const materialKey = String(material?.name || '').trim().toLowerCase();
    const hints = hintsByMaterial[materialKey] || [];

    if (!hints.length) {
      return material;
    }

    usedCatalogData = true;

    const catalogPrices = hints.map((hint) => ({
      retailer: hint.retailer,
      price: Number(hint.avgPrice),
      url: `https://www.google.com/search?q=${encodeURIComponent(`${hint.retailer} ${input.city || ''} ${input.state || ''} ${material.name}`)}`,
      inStock: true,
    }));

    const combinedPrices = [...catalogPrices, ...(material.prices || [])].filter(
      (entry, index, list) => list.findIndex((item) => item.retailer === entry.retailer) === index
    );

    const sorted = [...combinedPrices].sort((a, b) => Number(a.price) - Number(b.price) || String(a.retailer).localeCompare(String(b.retailer)));
    const bestUnitPrice = sorted[0]?.price ?? material.bestPrice;
    const quantityValue = Number(material?.quantityValue || parseQuantityValue(String(material?.quantity || '1')));
    return {
      ...material,
      prices: sorted,
      bestPrice: bestUnitPrice,
      bestRetailer: sorted[0]?.retailer ?? material.bestRetailer,
      quantityValue,
      lineTotal: Number((Number(bestUnitPrice || 0) * quantityValue).toFixed(2)),
    };
  });

  if (!usedCatalogData) {
    return quote;
  }

  const totalCost = mergedMaterials.reduce((sum: number, item: any) => sum + Number(item.lineTotal || 0), 0);
  const retailersCompared = rankRetailersByAveragePrice(mergedMaterials);

  return {
    ...quote,
    materials: mergedMaterials,
    totalCost: totalCost.toFixed(2),
    retailersCompared,
    note: 'Prices blend recent location-based catalog observations with live estimate heuristics. Verify current pricing with retailers.',
  };
}
