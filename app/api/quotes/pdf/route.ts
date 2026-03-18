import { NextRequest, NextResponse } from 'next/server';
import { emailEstimateDocument, generateEstimateDocument } from '../../../../lib/services/estimateDocumentService';

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

    const { pdfBuffer } = await generateEstimateDocument(estimateId);
    const pdfBytes = new Uint8Array(pdfBuffer);

    // Return PDF as download
    return new NextResponse(pdfBytes, {
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

    const info = await emailEstimateDocument({
      estimateId,
      recipientEmail,
      sendCopy,
    });

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
