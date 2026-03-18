import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { type EstimatePdfData } from './domain/estimate';

export async function generateEstimatePDF(estimateData: EstimatePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      // Buffer to store PDF data
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors
      const primaryColor = '#667eea';
      const darkGray = '#333333';
      const mediumGray = '#666666';
      const lightGray = '#999999';
      const borderColor = '#e5e7eb';

      // Helper function to draw a line
      const drawLine = (y: number, color: string = borderColor) => {
        doc
          .strokeColor(color)
          .lineWidth(1)
          .moveTo(50, y)
          .lineTo(562, y)
          .stroke();
      };

      // HEADER
      doc
        .fontSize(32)
        .fillColor(primaryColor)
        .text('🏗️', 50, 50, { continued: true })
        .fontSize(24)
        .text(' LeadGen Pro', { link: null });

      doc
        .fontSize(10)
        .fillColor(mediumGray)
        .text('Construction Estimate', 50, 85);

      // Estimate details (top right)
      const rightX = 400;
      doc
        .fontSize(10)
        .fillColor(lightGray)
        .text('ESTIMATE #', rightX, 50)
        .fillColor(darkGray)
        .text(estimateData.id, rightX, 65);

      doc
        .fillColor(lightGray)
        .text('DATE', rightX, 85)
        .fillColor(darkGray)
        .text(new Date(estimateData.createdAt).toLocaleDateString(), rightX, 100);

      doc
        .fillColor(lightGray)
        .text('VALID UNTIL', rightX, 120)
        .fillColor(darkGray)
        .text(new Date(estimateData.validUntil).toLocaleDateString(), rightX, 135);

      // Line separator
      drawLine(170);

      // CONTRACTOR INFORMATION
      let currentY = 190;
      doc
        .fontSize(12)
        .fillColor(darkGray)
        .font('Helvetica-Bold')
        .text('FROM', 50, currentY);

      currentY += 20;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(estimateData.contractor.businessName || estimateData.contractor.name, 50, currentY);

      currentY += 15;
      doc
        .font('Helvetica')
        .fillColor(mediumGray)
        .text(estimateData.contractor.email, 50, currentY);

      if (estimateData.contractor.phone) {
        currentY += 15;
        doc.text(estimateData.contractor.phone, 50, currentY);
      }

      if (estimateData.contractor.address) {
        currentY += 15;
        doc.text(estimateData.contractor.address, 50, currentY);
      }

      if (estimateData.contractor.licenseNumber) {
        currentY += 15;
        doc.text(`License: ${estimateData.contractor.licenseNumber}`, 50, currentY);
      }

      // HOMEOWNER INFORMATION
      currentY = 190;
      doc
        .fontSize(12)
        .fillColor(darkGray)
        .font('Helvetica-Bold')
        .text('TO', rightX, currentY);

      currentY += 20;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(estimateData.homeowner.name, rightX, currentY);

      currentY += 15;
      doc
        .font('Helvetica')
        .fillColor(mediumGray)
        .text(estimateData.homeowner.email, rightX, currentY);

      if (estimateData.homeowner.phone) {
        currentY += 15;
        doc.text(estimateData.homeowner.phone, rightX, currentY);
      }

      if (estimateData.homeowner.address) {
        currentY += 15;
        doc.text(estimateData.homeowner.address, rightX, currentY);
      }

      // PROJECT TITLE
      currentY = 310;
      drawLine(currentY);
      currentY += 20;

      doc
        .fontSize(14)
        .fillColor(darkGray)
        .font('Helvetica-Bold')
        .text('PROJECT', 50, currentY);

      currentY += 20;
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(estimateData.projectTitle, 50, currentY, { width: 500 });

      // LINE ITEMS TABLE
      currentY += 40;
      drawLine(currentY);
      currentY += 15;

      // Table header
      doc
        .fontSize(9)
        .fillColor(lightGray)
        .font('Helvetica-Bold')
        .text('DESCRIPTION', 50, currentY)
        .text('QTY', 350, currentY, { width: 50, align: 'right' })
        .text('UNIT PRICE', 410, currentY, { width: 70, align: 'right' })
        .text('TOTAL', 490, currentY, { width: 72, align: 'right' });

      currentY += 20;
      drawLine(currentY);
      currentY += 15;

      // Group line items by category
      const categories = ['labor', 'materials', 'equipment', 'permits', 'other'];
      const categoryLabels = {
        labor: 'Labor',
        materials: 'Materials',
        equipment: 'Equipment',
        permits: 'Permits & Fees',
        other: 'Other',
      };

      categories.forEach((category) => {
        const categoryItems = estimateData.lineItems.filter((item) => item.category === category);
        
        if (categoryItems.length > 0) {
          // Category header
          doc
            .fontSize(10)
            .fillColor(darkGray)
            .font('Helvetica-Bold')
            .text(categoryLabels[category as keyof typeof categoryLabels], 50, currentY);
          
          currentY += 18;

          // Items in category
          categoryItems.forEach((item) => {
            // Check if we need a new page
            if (currentY > 700) {
              doc.addPage();
              currentY = 50;
            }

            doc
              .fontSize(9)
              .fillColor(mediumGray)
              .font('Helvetica')
              .text(item.description, 50, currentY, { width: 290 })
              .text(item.quantity.toString(), 350, currentY, { width: 50, align: 'right' })
              .text(`$${item.unitPrice.toFixed(2)}`, 410, currentY, { width: 70, align: 'right' })
              .fillColor(darkGray)
              .text(`$${item.total.toFixed(2)}`, 490, currentY, { width: 72, align: 'right' });

            currentY += 20;
          });

          currentY += 5;
        }
      });

      // TOTALS SECTION
      currentY += 10;
      drawLine(currentY);
      currentY += 20;

      const totalsX = 410;
      const valuesX = 490;

      doc
        .fontSize(10)
        .fillColor(mediumGray)
        .font('Helvetica')
        .text('Subtotal:', totalsX, currentY, { width: 70, align: 'right' })
        .fillColor(darkGray)
        .text(`$${estimateData.subtotal.toFixed(2)}`, valuesX, currentY, { width: 72, align: 'right' });

      currentY += 20;
      doc
        .fillColor(mediumGray)
        .text(`Tax (${(estimateData.taxRate * 100).toFixed(2)}%):`, totalsX, currentY, { width: 70, align: 'right' })
        .fillColor(darkGray)
        .text(`$${estimateData.tax.toFixed(2)}`, valuesX, currentY, { width: 72, align: 'right' });

      currentY += 25;
      drawLine(currentY);
      currentY += 15;

      doc
        .fontSize(12)
        .fillColor(darkGray)
        .font('Helvetica-Bold')
        .text('TOTAL:', totalsX, currentY, { width: 70, align: 'right' })
        .text(`$${estimateData.total.toFixed(2)}`, valuesX, currentY, { width: 72, align: 'right' });

      // NOTES SECTION
      if (estimateData.notes && estimateData.notes.trim()) {
        currentY += 50;
        
        // Check if we need a new page
        if (currentY > 650) {
          doc.addPage();
          currentY = 50;
        }

        drawLine(currentY);
        currentY += 20;

        doc
          .fontSize(10)
          .fillColor(darkGray)
          .font('Helvetica-Bold')
          .text('NOTES', 50, currentY);

        currentY += 20;
        doc
          .fontSize(9)
          .fillColor(mediumGray)
          .font('Helvetica')
          .text(estimateData.notes, 50, currentY, { width: 512 });
      }

      // FOOTER
      const footerY = 720;
      drawLine(footerY);
      
      doc
        .fontSize(8)
        .fillColor(lightGray)
        .text(
          'This estimate is valid until the date specified above. Terms and conditions apply.',
          50,
          footerY + 15,
          { width: 512, align: 'center' }
        );

      doc
        .fontSize(7)
        .text(
          `Generated on ${new Date().toLocaleString()} | LeadGen Pro`,
          50,
          footerY + 30,
          { width: 512, align: 'center' }
        );

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to create a readable stream from buffer (for sending as email attachment)
export function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

export default {
  generateEstimatePDF,
  bufferToStream,
};
