import { isEmailEnabled, transporter } from '../email';
import { logPlatformEvent } from '../eventLogger';
import { generateEstimatePDF } from '../pdf';
import { type EstimatePdfData } from '../domain/estimate';
import { getEstimateById } from './estimateService';
import { getProjectById } from './projectService';
import { getAuthUserById } from './authService';

async function assembleEstimatePdfData(estimateId: string, recipientEmail?: string): Promise<EstimatePdfData> {
  const estimate = await getEstimateById(estimateId);
  const project = estimate ? await getProjectById(estimate.projectId) : null;

  const [contractorUser, homeownerUser] = await Promise.all([
    estimate?.contractorId ? getAuthUserById(estimate.contractorId) : Promise.resolve(null),
    project?.ownerId ? getAuthUserById(project.ownerId) : Promise.resolve(null),
  ]);

  const contractorName = contractorUser
    ? (contractorUser.businessName ?? `${contractorUser.firstName} ${contractorUser.lastName}`)
    : 'Your Contractor';

  const homeownerName = homeownerUser
    ? `${homeownerUser.firstName} ${homeownerUser.lastName}`
    : 'Homeowner';

  return {
    id: estimateId,
    projectTitle: project?.title ?? estimate?.projectTitle ?? 'Construction Project',
    projectId: estimate?.projectId ?? '',
    contractor: {
      name: contractorName,
      businessName: contractorUser?.businessName,
      email: contractorUser?.email ?? 'contractor@example.com',
      phone: contractorUser?.phone ?? '',
      address: contractorUser?.address,
    },
    homeowner: {
      name: homeownerName,
      email: recipientEmail ?? homeownerUser?.email ?? 'homeowner@example.com',
      phone: homeownerUser?.phone,
      address: homeownerUser?.address,
    },
    lineItems: estimate?.lineItems ?? [],
    subtotal: estimate?.subtotal ?? 0,
    taxRate: 0,
    tax: estimate?.tax ?? 0,
    total: estimate?.total ?? 0,
    notes: estimate?.notes,
    validUntil: estimate?.validUntil ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: estimate?.createdAt ?? new Date().toISOString(),
  };
}

export async function generateEstimateDocument(estimateId: string): Promise<{ estimateData: EstimatePdfData; pdfBuffer: Buffer }> {
  const estimateData = await assembleEstimatePdfData(estimateId);
  const pdfBuffer = await generateEstimatePDF({
    ...estimateData,
    contractor: {
      ...estimateData.contractor,
      phone: estimateData.contractor.phone ?? '',
    },
  });

  logPlatformEvent({
    type: 'estimate_pdf_generated',
    entityType: 'document',
    entityId: estimateId,
    metadata: {
      projectId: estimateData.projectId,
      total: estimateData.total,
      recipientEmail: estimateData.homeowner.email,
    },
  });

  return { estimateData, pdfBuffer };
}

export async function emailEstimateDocument(input: {
  estimateId: string;
  recipientEmail: string;
  sendCopy?: boolean;
}): Promise<{ messageId: string }> {
  const estimateData = await assembleEstimatePdfData(input.estimateId, input.recipientEmail);
  const pdfBuffer = await generateEstimatePDF({
    ...estimateData,
    contractor: {
      ...estimateData.contractor,
      phone: estimateData.contractor.phone ?? '',
    },
  });

  if (!isEmailEnabled()) {
    logPlatformEvent({
      type: 'estimate_pdf_emailed',
      entityType: 'document',
      entityId: input.estimateId,
      metadata: { recipientEmail: input.recipientEmail, sendCopy: Boolean(input.sendCopy), skipped: 'email-disabled' },
    });
    return { messageId: 'email-disabled' };
  }

  const mailOptions = {
    from: {
      name: 'LeadGen Pro',
      address: process.env.SMTP_USER || 'noreply@leadgenpro.com',
    },
    to: input.recipientEmail,
    cc: input.sendCopy ? estimateData.contractor.email : undefined,
    subject: `Estimate for ${estimateData.projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Your Estimate</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #667eea;">Your Construction Estimate</h2>
            <p>Dear ${estimateData.homeowner.name},</p>
            <p>Please find attached the detailed estimate for your project: <strong>${estimateData.projectTitle}</strong></p>
            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Total Estimate:</strong> $${estimateData.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p style="margin: 5px 0 0;"><strong>Valid Until:</strong> ${new Date(estimateData.validUntil).toLocaleDateString()}</p>
            </div>
            <p>If you have any questions or would like to discuss this estimate, please don't hesitate to contact me.</p>
            <p>Best regards,<br>
            <strong>${estimateData.contractor.businessName || estimateData.contractor.name}</strong><br>
            ${estimateData.contractor.phone}<br>
            ${estimateData.contractor.email}</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Your Construction Estimate
      
      Dear ${estimateData.homeowner.name},
      
      Please find attached the detailed estimate for your project: ${estimateData.projectTitle}
      
      Total Estimate: $${estimateData.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      Valid Until: ${new Date(estimateData.validUntil).toLocaleDateString()}
      
      If you have any questions, please contact me.
      
      ${estimateData.contractor.businessName || estimateData.contractor.name}
      ${estimateData.contractor.phone}
      ${estimateData.contractor.email}
    `,
    attachments: [
      {
        filename: `estimate-${input.estimateId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  const info = await transporter.sendMail(mailOptions);

  logPlatformEvent({
    type: 'estimate_pdf_emailed',
    entityType: 'document',
    entityId: input.estimateId,
    metadata: {
      recipientEmail: input.recipientEmail,
      sendCopy: Boolean(input.sendCopy),
      messageId: info.messageId,
    },
  });

  return { messageId: info.messageId };
}
