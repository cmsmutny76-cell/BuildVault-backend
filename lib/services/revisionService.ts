import { type EstimateRevision, type EstimateRevisionChange } from '../domain/estimate';
import { dbQuery, isDatabaseEnabled } from '../db';
import { logPlatformEvent } from '../eventLogger';
import { getEstimateById } from './estimateService';
import { projectExists } from './projectService';

const revisionStore = new Map<string, EstimateRevision[]>();

interface RevisionRow {
  id: string;
  estimate_id: string;
  project_id: string;
  updated_by: string;
  reason: string;
  changes: EstimateRevisionChange[];
  created_at: Date;
}

function mapRevisionRow(row: RevisionRow): EstimateRevision {
  return {
    id: row.id,
    estimateId: row.estimate_id,
    updatedBy: row.updated_by,
    reason: row.reason,
    changes: row.changes,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function listEstimateRevisions(estimateId: string): Promise<EstimateRevision[]> {
  if (!isDatabaseEnabled()) {
    return revisionStore.get(estimateId) || [];
  }

  const rows = await dbQuery<RevisionRow>('SELECT * FROM app_estimate_revisions WHERE estimate_id = $1 ORDER BY created_at DESC', [estimateId]);
  return rows.map(mapRevisionRow);
}

export async function createEstimateRevision(input: {
  estimateId: string;
  projectId: string;
  updatedBy: string;
  reason: string;
  changes: EstimateRevisionChange[];
}):
  Promise<
    | { success: true; revision: EstimateRevision; totalRevisions: number }
    | { success: false; status: number; error: string }
  > {
  const estimate = await getEstimateById(input.estimateId);
  if (!estimate) {
    return { success: false, status: 404, error: 'estimateId not found' };
  }

  if (estimate.projectId !== input.projectId) {
    return { success: false, status: 400, error: 'estimateId does not belong to projectId' };
  }

  if (!(await projectExists(input.projectId))) {
    return { success: false, status: 404, error: 'projectId does not exist' };
  }

  const revision: EstimateRevision = {
    id: `rev_${Date.now()}`,
    estimateId: input.estimateId,
    updatedBy: input.updatedBy,
    reason: input.reason,
    changes: input.changes,
    createdAt: new Date().toISOString(),
  };

  let totalRevisions = 0;

  if (isDatabaseEnabled()) {
    await dbQuery(
      `INSERT INTO app_estimate_revisions (id, estimate_id, project_id, updated_by, reason, changes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
      [revision.id, input.estimateId, input.projectId, input.updatedBy, input.reason, JSON.stringify(input.changes), revision.createdAt]
    );
    const countRows = await dbQuery<{ count: string }>('SELECT COUNT(*)::text AS count FROM app_estimate_revisions WHERE estimate_id = $1', [input.estimateId]);
    totalRevisions = Number(countRows[0]?.count || 0);
  } else {
    const existing = revisionStore.get(input.estimateId) || [];
    revisionStore.set(input.estimateId, [revision, ...existing]);
    totalRevisions = revisionStore.get(input.estimateId)?.length || 0;
  }

  logPlatformEvent({
    type: 'revision_added',
    entityType: 'revision',
    entityId: revision.id,
    metadata: {
      estimateId: input.estimateId,
      projectId: input.projectId,
      updatedBy: input.updatedBy,
      changeCount: input.changes.length,
    },
  });

  return {
    success: true,
    revision,
    totalRevisions,
  };
}
