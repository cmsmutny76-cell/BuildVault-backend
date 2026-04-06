import OpenAI from 'openai';
import { logPlatformEvent } from '../eventLogger';
import type { NormalizedMaterial } from './reportBuilderService';

type HardwareEstimationInput = {
  hardwareItems: NormalizedMaterial[];
  baseMaterials: NormalizedMaterial[];
  analysisData?: any;
  projectType?: string;
  location?: { city?: string; state?: string; zipCode?: string } | null;
  contextType: 'photo' | 'blueprint';
};

export type HardwareQuantityEstimationResult = {
  items: NormalizedMaterial[];
  method: 'ai' | 'heuristic';
};

function parseQuantityValue(quantity: string): number {
  const normalizedQuantity = String(quantity || '').trim().toLowerCase().replace(/,/g, '');
  if (!normalizedQuantity) {
    return 0;
  }

  const mixedFractionMatch = normalizedQuantity.match(/(\d+)\s+(\d+)\/(\d+)/);
  if (mixedFractionMatch) {
    const whole = Number(mixedFractionMatch[1]);
    const numerator = Number(mixedFractionMatch[2]);
    const denominator = Number(mixedFractionMatch[3]);
    if (denominator > 0) {
      return whole + numerator / denominator;
    }
  }

  const fractionMatch = normalizedQuantity.match(/\b(\d+)\/(\d+)\b/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (denominator > 0) {
      return numerator / denominator;
    }
  }

  const rangeMatch = normalizedQuantity.match(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    if (Number.isFinite(start) && Number.isFinite(end)) {
      return (start + end) / 2;
    }
  }

  const firstNumberMatch = normalizedQuantity.match(/\d+(?:\.\d+)?/);
  if (!firstNumberMatch) {
    return 0;
  }

  const quantityValue = Number(firstNumberMatch[0]);
  return Number.isFinite(quantityValue) ? quantityValue : 0;
}

function parseDimensionValue(value: unknown): number {
  return parseQuantityValue(String(value || ''));
}

function sumMatchingMaterials(baseMaterials: NormalizedMaterial[], pattern: RegExp): number {
  return baseMaterials.reduce((sum, item) => {
    if (!pattern.test(String(item.name || '').toLowerCase())) {
      return sum;
    }
    const quantity = parseQuantityValue(item.quantity);
    return sum + (quantity > 0 ? quantity : 0);
  }, 0);
}

function buildProjectSignals(baseMaterials: NormalizedMaterial[], analysisData?: any) {
  const dimensions = analysisData?.dimensions || analysisData?.measurements || {};
  const area = parseDimensionValue(dimensions?.area || dimensions?.estimatedArea || dimensions?.totalSquareFootage);
  const length = parseDimensionValue(dimensions?.length || dimensions?.overallLength);
  const width = parseDimensionValue(dimensions?.width || dimensions?.overallWidth);
  const perimeter = length > 0 && width > 0 ? (length + width) * 2 : 0;

  return {
    area,
    perimeter,
    joists: sumMatchingMaterials(baseMaterials, /(joist|truss|rafter)/),
    studs: sumMatchingMaterials(baseMaterials, /stud/),
    outlets: sumMatchingMaterials(baseMaterials, /(outlet|receptacle)/),
    switches: sumMatchingMaterials(baseMaterials, /switch/),
    breakers: sumMatchingMaterials(baseMaterials, /breaker/),
    junctionBoxes: sumMatchingMaterials(baseMaterials, /(junction box|electrical box)/),
    plumbingFixtures: sumMatchingMaterials(baseMaterials, /(fixture|sink|faucet|toilet|shower|tub|valve|pipe)/),
    smokeDetectors: sumMatchingMaterials(baseMaterials, /smoke detector/),
  };
}

function roundQuantity(value: number): string {
  const rounded = value >= 10 ? Math.ceil(value) : Number(value.toFixed(1));
  return String(rounded > 0 ? rounded : 1);
}

function estimateHardwareLineHeuristically(item: NormalizedMaterial, baseMaterials: NormalizedMaterial[], analysisData?: any): NormalizedMaterial {
  const signals = buildProjectSignals(baseMaterials, analysisData);
  const normalizedName = String(item.name || '').toLowerCase();

  const withQuantity = (quantity: number, unit = item.unit || 'each') => ({
    ...item,
    quantity: roundQuantity(quantity),
    unit,
  });

  if (/(joist hanger)/.test(normalizedName)) {
    return withQuantity(signals.joists || Math.max(8, signals.area > 0 ? signals.area / 16 : 8), 'each');
  }
  if (/(hurricane tie|strap)/.test(normalizedName)) {
    return withQuantity(signals.joists || Math.max(8, signals.area > 0 ? signals.area / 20 : 8), 'each');
  }
  if (/(nail plate|stud guard)/.test(normalizedName)) {
    const penetrations = signals.outlets + signals.switches + signals.junctionBoxes + signals.plumbingFixtures;
    return withQuantity(penetrations || Math.max(12, signals.studs * 0.15 || signals.area / 30), 'each');
  }
  if (/(anchor bolt)/.test(normalizedName)) {
    return withQuantity(signals.perimeter > 0 ? Math.ceil(signals.perimeter / 6) : 8, 'each');
  }
  if (/(seismic|earthquake|hold-down)/.test(normalizedName)) {
    return withQuantity(signals.perimeter > 0 ? Math.max(4, Math.ceil(signals.perimeter / 25)) : 4, 'set');
  }
  if (/(gfci)/.test(normalizedName)) {
    return withQuantity(signals.outlets > 0 ? Math.max(2, Math.ceil(signals.outlets * 0.25)) : Math.max(2, signals.area / 400), 'each');
  }
  if (/(afci)/.test(normalizedName)) {
    return withQuantity(signals.breakers > 0 ? Math.max(2, Math.ceil(signals.breakers * 0.5)) : Math.max(2, signals.area / 500), 'each');
  }
  if (/(tamper-resistant outlet)/.test(normalizedName)) {
    return withQuantity(signals.outlets > 0 ? signals.outlets : Math.max(6, signals.area / 100), 'each');
  }
  if (/(smoke detector)/.test(normalizedName)) {
    return withQuantity(signals.smokeDetectors || Math.max(2, signals.area / 600), 'each');
  }
  if (/(co detector|carbon monoxide)/.test(normalizedName)) {
    return withQuantity(Math.max(1, signals.area / 1000), 'each');
  }
  if (/(insulation baffle)/.test(normalizedName)) {
    return withQuantity(signals.joists || Math.max(8, signals.area / 16), 'each');
  }
  if (/(vapor barrier)/.test(normalizedName)) {
    return withQuantity(signals.area || 100, 'sqft');
  }

  return withQuantity(parseQuantityValue(item.quantity) || 1, item.unit || 'each');
}

async function estimateHardwareWithAi(input: HardwareEstimationInput): Promise<NormalizedMaterial[] | null> {
  const apiKey = process.env.OPENAI_API_KEY || '';
  if (!apiKey || input.hardwareItems.length === 0) {
    return null;
  }

  const openai = new OpenAI({ apiKey });
  const compactContext = {
    contextType: input.contextType,
    projectType: input.projectType,
    location: input.location,
    dimensions: input.analysisData?.dimensions || input.analysisData?.measurements || {},
    baseMaterials: input.baseMaterials,
    hardwareItems: input.hardwareItems,
  };

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You estimate code-required construction hardware quantities. Return JSON only. Every hardware item must include a numeric quantity and unit based on the supplied project dimensions and materials. Use best-estimate counts when exact counts are unavailable.',
        },
        {
          role: 'user',
          content: `Estimate quantities for the code-required hardware in this project context. Return a JSON array where each item is {"name":"string","quantity":"numeric string","unit":"string"}. Do not return explanatory text.\n\n${JSON.stringify(compactContext)}`,
        },
      ],
      max_tokens: 700,
    });

    const raw = response.choices[0]?.message?.content || '';
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }

    const byName = new Map(
      parsed
        .filter((item) => item && typeof item === 'object')
        .map((item) => [String(item.name || '').trim().toLowerCase(), item]),
    );

    const merged = input.hardwareItems.map((item) => {
      const aiItem = byName.get(String(item.name || '').trim().toLowerCase());
      const aiQuantity = aiItem ? parseQuantityValue(String(aiItem.quantity || '')) : 0;
      if (!aiItem || aiQuantity <= 0) {
        return estimateHardwareLineHeuristically(item, input.baseMaterials, input.analysisData);
      }

      return {
        ...item,
        quantity: roundQuantity(aiQuantity),
        unit: String(aiItem.unit || item.unit || 'each'),
      };
    });

    logPlatformEvent({
      type: 'code_hardware_quantity_estimated',
      entityType: 'compliance',
      entityId: `${input.location?.state || 'unknown'}:${input.location?.city || 'unknown'}`,
      metadata: {
        contextType: input.contextType,
        projectType: input.projectType,
        method: 'ai',
        hardwareCount: merged.length,
      },
    });

    return merged;
  } catch (error) {
    console.warn('Hardware quantity AI estimation failed:', error);
    return null;
  }
}

export async function estimateCodeHardwareQuantities(input: HardwareEstimationInput): Promise<HardwareQuantityEstimationResult> {
  if (!input.hardwareItems.length) {
    return {
      items: [],
      method: 'heuristic',
    };
  }

  const aiEstimated = await estimateHardwareWithAi(input);
  if (aiEstimated) {
    return {
      items: aiEstimated,
      method: 'ai',
    };
  }

  const heuristicResult = input.hardwareItems.map((item) =>
    estimateHardwareLineHeuristically(item, input.baseMaterials, input.analysisData),
  );

  logPlatformEvent({
    type: 'code_hardware_quantity_estimated',
    entityType: 'compliance',
    entityId: `${input.location?.state || 'unknown'}:${input.location?.city || 'unknown'}`,
    metadata: {
      contextType: input.contextType,
      projectType: input.projectType,
      method: 'heuristic',
      hardwareCount: heuristicResult.length,
    },
  });

  return {
    items: heuristicResult,
    method: 'heuristic',
  };
}