/**
 * Shared report building utilities for AI analysis routes
 * Consolidates helpers for photo and blueprint analysis
 */

export type NormalizedMaterial = {
  name: string;
  quantity: string;
  unit: string;
};

export function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function normalizeMaterialName(value: string): string {
  return value.trim().toLowerCase();
}

export function mergeMaterials(baseMaterials: NormalizedMaterial[], additions: NormalizedMaterial[]): NormalizedMaterial[] {
  const merged = [...baseMaterials];
  const seen = new Set(baseMaterials.map((item) => normalizeMaterialName(item.name)));
  for (const item of additions) {
    const key = normalizeMaterialName(item.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

export function extractHardwareFromCodes(codes: any): NormalizedMaterial[] {
  const collected: NormalizedMaterial[] = [];
  if (!codes || typeof codes !== 'object') {
    return collected;
  }

  const addHardwareArray = (hardwareArray: any[]) => {
    for (const hardwareItem of hardwareArray) {
      const name = String(hardwareItem?.name || '').trim();
      if (!name) continue;
      collected.push({
        name,
        quantity: String(hardwareItem?.quantity || 'as required by code'),
        unit: 'unit',
      });
    }
  };

  for (const value of Object.values(codes)) {
    if (value && typeof value === 'object' && Array.isArray((value as any).hardware)) {
      addHardwareArray((value as any).hardware);
    }
  }

  if (Array.isArray((codes as any).categories)) {
    for (const category of (codes as any).categories) {
      if (Array.isArray(category?.hardware)) {
        addHardwareArray(category.hardware);
      }
    }
  }

  return collected;
}

export function inferApplicableHardware(input: {
  baseMaterials: NormalizedMaterial[];
  state?: string;
  projectType?: string;
  codes?: any;
}): NormalizedMaterial[] {
  const hardwareFromCodes = extractHardwareFromCodes(input.codes);
  const mergedNames = new Set(input.baseMaterials.map((item) => normalizeMaterialName(item.name)));
  const keywordBlob = `${input.projectType || ''} ${input.baseMaterials.map((item) => item.name).join(' ')}`.toLowerCase();
  const inferred: NormalizedMaterial[] = [...hardwareFromCodes];

  const isFramingRelated = /(framing|joist|rafter|beam|stud|truss|header|shear|lumber)/.test(keywordBlob);
  if (isFramingRelated) {
    inferred.push(
      { name: 'Joist Hangers', quantity: 'as required by framing layout', unit: 'each' },
      { name: 'Nail Plates / Stud Guards', quantity: 'as required where piping/wiring passes through studs', unit: 'each' }
    );
  }

  const stateCode = String(input.state || '').toUpperCase();
  const seismicStates = new Set(['CA', 'AK', 'WA', 'OR', 'NV', 'UT', 'HI', 'ID', 'MT', 'WY']);
  const highWindStates = new Set(['FL', 'TX', 'LA', 'MS', 'AL', 'GA', 'SC', 'NC']);

  if (seismicStates.has(stateCode)) {
    inferred.push({ name: 'Seismic / Earthquake Brackets and Hold-Downs', quantity: 'as required by seismic design category', unit: 'set' });
  }
  if (highWindStates.has(stateCode)) {
    inferred.push({ name: 'Hurricane Ties / Straps', quantity: 'as required at roof-to-wall and uplift points', unit: 'each' });
  }

  return inferred.filter((item) => {
    const key = normalizeMaterialName(item.name);
    return key && !mergedNames.has(key);
  });
}

export function buildMaterialsQuoteReportText(
  materialQuote: any,
  context: { projectType?: string; location?: { city?: string; state?: string; zipCode?: string } | null }
): string {
  const lines: string[] = [];
  lines.push('MATERIALS QUOTE REPORT');
  lines.push(`Project Type: ${context.projectType ? toTitleCase(context.projectType) : 'General Project'}`);
  lines.push(`Location: ${context.location?.city || 'N/A'}, ${context.location?.state || 'N/A'} ${context.location?.zipCode || ''}`.trim());
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  lines.push(`Total Estimate: $${materialQuote?.totalCost || '0.00'}`);
  lines.push(`Retailers Compared: ${(materialQuote?.retailersCompared || []).join(', ') || 'N/A'}`);
  lines.push('');
  lines.push('Line Items:');

  const materials = Array.isArray(materialQuote?.materials) ? materialQuote.materials : [];
  if (materials.length === 0) {
    lines.push('- No materials listed.');
  } else {
    for (const material of materials) {
      const quantityValue = Number(material?.quantityValue || 1);
      const bestUnitPrice = Number(material?.bestPrice || 0);
      const lineTotal = Number(material?.lineTotal || bestUnitPrice * quantityValue);
      lines.push(
        `- ${material.name}: ${material.quantity || 'N/A'} ${material.unit || ''} | Best: ${material.bestRetailer || 'N/A'} @ $${bestUnitPrice.toFixed(2)} each | Line Total: $${lineTotal.toFixed(2)}`,
      );
    }
  }

  lines.push('');
  lines.push('Note: Prices are estimates and should be verified with retailers.');
  return lines.join('\n');
}

export function buildBuildingCodesReportText(input: {
  location?: { city?: string; county?: string; state?: string; zipCode?: string } | null;
  projectType?: string;
  agencies?: Record<string, any[]> | null;
  codes?: any;
  disclaimer?: string;
  generatedAt?: string;
}): string {
  const { location, projectType, agencies, codes, disclaimer, generatedAt } = input;
  const lines: string[] = [];
  lines.push('BUILDING CODES REPORT');
  lines.push(`Project Type: ${projectType ? toTitleCase(projectType) : 'General Project'}`);
  lines.push(
    `Location: ${location?.city || location?.county || 'N/A'}, ${location?.state || 'N/A'} ${location?.zipCode || ''}`.trim(),
  );
  lines.push(`Generated: ${generatedAt ? new Date(generatedAt).toLocaleString() : new Date().toLocaleString()}`);
  lines.push('');

  if (agencies) {
    lines.push('Code Enforcement Agencies:');
    for (const scope of ['federal', 'state', 'city', 'county']) {
      const items = Array.isArray(agencies[scope]) ? agencies[scope] : [];
      if (items.length === 0) continue;
      lines.push(`- ${toTitleCase(scope)}:`);
      for (const agency of items) {
        lines.push(`  * ${agency?.name || 'Unknown agency'}${agency?.url ? ` (${agency.url})` : ''}`);
      }
    }
    lines.push('');
  }

  lines.push('Code Requirements:');
  if (!codes || typeof codes !== 'object') {
    lines.push('- No code requirements available.');
  } else {
    for (const [categoryName, categoryValue] of Object.entries(codes)) {
      if (!categoryValue || typeof categoryValue !== 'object') {
        continue;
      }

      lines.push(`- ${toTitleCase(categoryName)}:`);

      const requirements = Array.isArray((categoryValue as any).requirements)
        ? (categoryValue as any).requirements
        : Array.isArray((categoryValue as any).required)
          ? (categoryValue as any).required
          : [];

      if (requirements.length > 0) {
        lines.push('  Requirements:');
        for (const requirement of requirements) {
          lines.push(`  * ${String(requirement)}`);
        }
      }

      const hardware = Array.isArray((categoryValue as any).hardware)
        ? (categoryValue as any).hardware
        : [];

      if (hardware.length > 0) {
        lines.push('  Hardware:');
        for (const item of hardware) {
          const name = String(item?.name || 'Unknown item');
          const quantity = item?.quantity ? ` - ${String(item.quantity)}` : '';
          const code = item?.code ? ` [${String(item.code)}]` : '';
          lines.push(`  * ${name}${quantity}${code}`);
        }
      }

      for (const [key, value] of Object.entries(categoryValue as Record<string, unknown>)) {
        if (key === 'requirements' || key === 'required' || key === 'hardware') {
          continue;
        }

        if (Array.isArray(value)) {
          if (value.length === 0) continue;
          lines.push(`  ${toTitleCase(key)}:`);
          for (const item of value) {
            lines.push(`  * ${String(item)}`);
          }
          continue;
        }

        if (value != null && typeof value !== 'object') {
          lines.push(`  ${toTitleCase(key)}: ${String(value)}`);
        }
      }
    }
  }

  if (disclaimer) {
    lines.push('');
    lines.push(`Note: ${disclaimer}`);
  }

  return lines.join('\n');
}
