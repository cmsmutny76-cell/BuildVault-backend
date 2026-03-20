import { sendEstimateRejectedEmail } from '../email';
import { logPlatformEvent } from '../eventLogger';
import { getAuthUserById } from './authService';
import { getEstimateById } from './estimateService';
import { getProjectById } from './projectService';

export interface EstimateRejection {
  estimateId: string;
  projectId: string;
  userId: string;
  rejectedAt: string;
}

export async function rejectEstimate(input: {
  estimateId: string;
  userId: string;
  projectId: string;
}): Promise<
  | { success: true; rejection: EstimateRejection }
  | { success: false; status: number; error: string }
> {
  const estimate = await getEstimateById(input.estimateId);
  if (!estimate) {
    return { success: false, status: 404, error: 'estimateId not found' };
  }

  if (estimate.projectId !== input.projectId) {
    return { success: false, status: 400, error: 'estimateId does not belong to projectId' };
  }

  const project = await getProjectById(input.projectId);
  if (!project) {
    return { success: false, status: 404, error: 'projectId does not exist' };
  }

  const rejection: EstimateRejection = {
    estimateId: input.estimateId,
    projectId: input.projectId,
    userId: input.userId,
    rejectedAt: new Date().toISOString(),
  };

  const [contractorUser, homeownerUser] = await Promise.all([
    getAuthUserById(estimate.contractorId),
    getAuthUserById(project.ownerId),
  ]);

  const contractorEmail = contractorUser?.email ?? 'contractor@example.com';
  const contractorName = contractorUser
    ? (contractorUser.businessName ?? `${contractorUser.firstName} ${contractorUser.lastName}`)
    : 'Your Contractor';
  const homeownerName = homeownerUser
    ? `${homeownerUser.firstName} ${homeownerUser.lastName}`
    : 'Homeowner';

  const emailResult = await sendEstimateRejectedEmail(
    contractorEmail,
    contractorName,
    homeownerName,
    project.title,
    estimate.total
  );

  if (!emailResult.success) {
    console.error('Failed to send rejection email to contractor');
  }

  logPlatformEvent({
    type: 'estimate_rejected',
    entityType: 'estimate',
    entityId: input.estimateId,
    metadata: {
      projectId: input.projectId,
      userId: input.userId,
      total: estimate.total,
    },
  });

  return { success: true, rejection };
}
