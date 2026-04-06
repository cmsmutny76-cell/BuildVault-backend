import { NextRequest, NextResponse } from 'next/server';
import { generateEstimatePDF, bufferToStream } from '../../../../lib/pdf';
import { sendEstimateNotificationEmail } from '../../../../lib/email';
import nodemailer from 'nodemailer';

/**
 * GET /api/quotes/pdf?estimateId=xxx
 * Generate and download estimate as PDF
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estimateId = searchParams.get('estimateId');

    if (!estimateId) {
      return NextResponse.json(
        { success: false, error: 'Estimate ID is required' },
        { status: 400 }
      );
    }

    // TODO: Fetch estimate from database
    // Mock estimate data for now
    const estimateData = {
      id: estimateId,
      projectTitle: 'Kitchen Remodel',
      projectId: 'proj_1',
      contractor: {
        name: 'John Builder',
        businessName: 'Premium Builders LLC',
        email: 'john@premiumbuilders.com',
        phone: '(555) 123-4567',
        address: '123 Builder St, Austin, TX 78701',
        licenseNumber: 'TX-12345',
      },
      homeowner: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '(555) 987-6543',
        address: '456 Home Ave, Austin, TX 78702',
      },
      lineItems: [
        {
          id: '1',
          description: 'Demolition of existing kitchen cabinets and countertops',
          quantity: 1,
          unitPrice: 2500,
          total: 2500,
          category: 'labor' as const,
        },
        {
          id: '2',
          description: 'Plumbing rough-in for new fixtures',
          quantity: 8,
          unitPrice: 150,
          total: 1200,
          category: 'labor' as const,
        },
        {
          id: '3',
          description: 'Electrical work - new outlets and lighting',
          quantity: 1,
          unitPrice: 1800,
          total: 1800,
          category: 'labor' as const,
        },
        {
          id: '4',
          description: 'Custom maple cabinets (per linear foot)',
          quantity: 24,
          unitPrice: 425,
          total: 10200,
          category: 'materials' as const,
        },
        {
          id: '5',
          description: 'Quartz countertops (per square foot)',
          quantity: 45,
          unitPrice: 95,
          total: 4275,
          category: 'materials' as const,
        },
        {
          id: '6',
          description: 'Stainless steel sink and faucet',
          quantity: 1,
          unitPrice: 850,
          total: 850,
          category: 'materials' as const,
        },
        {
          id: '7',
          description: 'Tile flooring (per square foot)',
          quantity: 150,
          unitPrice: 12,
          total: 1800,
          category: 'materials' as const,
        },
        {
          id: '8',
          description: 'Paint and finishing supplies',
          quantity: 1,
          unitPrice: 675,
          total: 675,
          category: 'materials' as const,
        },
        {
          id: '9',
          description: 'Building permit',
          quantity: 1,
          unitPrice: 450,
          total: 450,
          category: 'permits' as const,
        },
        {
          id: '10',
          description: 'Waste removal and cleanup',
          quantity: 1,
          unitPrice: 750,
          total: 750,
          category: 'other' as const,
        },
      ],
      subtotal: 24500,
      taxRate: 0.0825,
      tax: 2021.25,
      total: 26521.25,
      notes: 'This estimate includes all materials and labor for a complete kitchen remodel. Timeline: 3-4 weeks. Payment schedule: 30% deposit, 40% at midpoint, 30% upon completion. All work guaranteed for 1 year.',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Generate PDF
    const pdfBuffer = await generateEstimatePDF(estimateData);

    // Return PDF as download
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="estimate-${estimateId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quotes/pdf
 * Send estimate as PDF via email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { estimateId, recipientEmail, sendCopy } = body;

    if (!estimateId || !recipientEmail) {
      return NextResponse.json(
        { success: false, error: 'Estimate ID and recipient email are required' },
        { status: 400 }
      );
    }

    // TODO: Fetch estimate from database
    // Mock estimate data (same as above)
    const estimateData = {
      id: estimateId,
      projectTitle: 'Kitchen Remodel',
      projectId: 'proj_1',
      contractor: {
        name: 'John Builder',
        businessName: 'Premium Builders LLC',
        email: 'john@premiumbuilders.com',
        phone: '(555) 123-4567',
        address: '123 Builder St, Austin, TX 78701',
        licenseNumber: 'TX-12345',
      },
      homeowner: {
        name: 'Jane Smith',
        email: recipientEmail,
        phone: '(555) 987-6543',
        address: '456 Home Ave, Austin, TX 78702',
      },
      lineItems: [
        {
          id: '1',
          description: 'Demolition of existing kitchen cabinets and countertops',
          quantity: 1,
          unitPrice: 2500,
          total: 2500,
          category: 'labor' as const,
        },
        {
          id: '2',
          description: 'Custom maple cabinets (per linear foot)',
          quantity: 24,
          unitPrice: 425,
          total: 10200,
          category: 'materials' as const,
        },
      ],
      subtotal: 24500,
      taxRate: 0.0825,
      tax: 2021.25,
      total: 26521.25,
      notes: 'This estimate includes all materials and labor for a complete kitchen remodel.',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Generate PDF
    const pdfBuffer = await generateEstimatePDF(estimateData);

    // Send email with PDF attachment
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password',
      },
    });

    const mailOptions = {
      from: {
        name: 'LeadGen Pro',
        address: process.env.SMTP_USER || 'noreply@leadgenpro.com',
      },
      to: recipientEmail,
      cc: sendCopy ? estimateData.contractor.email : undefined,
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
          filename: `estimate-${estimateId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Estimate PDF sent via email:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Estimate sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Failed to send estimate PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send estimate' },
      { status: 500 }
    );
  }
}
