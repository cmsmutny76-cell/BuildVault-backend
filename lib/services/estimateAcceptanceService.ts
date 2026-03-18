import { sendEstimateAcceptedEmail } from '../email';
import { logPlatformEvent } from '../eventLogger';
import { getAuthUserById } from './authService';
import { getEstimateById } from './estimateService';
import { getProjectById } from './projectService';

export interface EstimateAgreement {
  id: string;
  estimateId: string;
  projectId: string;
  userId: string;
  status: 'active';
  acceptedAt: string;
  startDate: string;
  expectedCompletionDate: string;
}

export async function acceptEstimate(input: {
  estimateId: string;
  userId: string;
  projectId: string;
}): Promise<
  | { success: true; agreement: EstimateAgreement }
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

  const agreement: EstimateAgreement = {
    id: 'agr_' + Date.now(),
    estimateId: input.estimateId,
    projectId: input.projectId,
    userId: input.userId,
    status: 'active',
    acceptedAt: new Date().toISOString(),
    startDate: new Date().toISOString(),
    expectedCompletionDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
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

  const emailResult = await sendEstimateAcceptedEmail(
    contractorEmail,
    contractorName,
    homeownerName,
    project.title,
    estimate.total
  );

  if (!emailResult.success) {
    console.error('Failed to send acceptance email to contractor');
  }

  logPlatformEvent({
    type: 'estimate_accepted',
    entityType: 'estimate',
    entityId: input.estimateId,
    metadata: {
      agreementId: agreement.id,
      projectId: input.projectId,
      userId: input.userId,
      total: estimate.total,
    },
  });

  return { success: true, agreement };
}
