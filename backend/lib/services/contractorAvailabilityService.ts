import { dbQuery, isDatabaseEnabled } from '../db';
import { logPlatformEvent } from '../eventLogger';

export type ContractorAvailability = 'available' | 'busy' | 'booked';

const availabilityStore = new Map<string, ContractorAvailability>();

interface ContractorAvailabilityRow {
  contractor_id: string;
  availability: ContractorAvailability;
  updated_at: Date;
}

export async function setContractorAvailability(contractorId: string, availability: ContractorAvailability): Promise<void> {
  if (isDatabaseEnabled()) {
    await dbQuery(
      `INSERT INTO app_contractor_availability (contractor_id, availability, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (contractor_id)
       DO UPDATE SET availability = EXCLUDED.availability, updated_at = EXCLUDED.updated_at`,
      [contractorId, availability, new Date().toISOString()]
    );
  } else {
    availabilityStore.set(contractorId, availability);
  }

  logPlatformEvent({
    type: 'contractor_availability_updated',
    entityType: 'matching',
    entityId: contractorId,
    metadata: {
      contractorId,
      availability,
    },
  });
}

export async function getContractorAvailability(contractorId: string): Promise<ContractorAvailability | null> {
  if (!isDatabaseEnabled()) {
    return availabilityStore.get(contractorId) || null;
  }

  const rows = await dbQuery<ContractorAvailabilityRow>(
    'SELECT contractor_id, availability, updated_at FROM app_contractor_availability WHERE contractor_id = $1 LIMIT 1',
    [contractorId]
  );

  return rows[0]?.availability || null;
}

export async function getAllAvailabilityOverrides(): Promise<Record<string, ContractorAvailability>> {
  if (!isDatabaseEnabled()) {
    const overrides: Record<string, ContractorAvailability> = {};
    availabilityStore.forEach((availability, contractorId) => {
      overrides[contractorId] = availability;
    });
    return overrides;
  }

  const rows = await dbQuery<ContractorAvailabilityRow>(
    'SELECT contractor_id, availability, updated_at FROM app_contractor_availability ORDER BY updated_at DESC'
  );

  return rows.reduce<Record<string, ContractorAvailability>>((accumulator, row) => {
    accumulator[row.contractor_id] = row.availability;
    return accumulator;
  }, {});
}