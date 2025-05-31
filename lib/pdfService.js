import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generateInvoicePDF(timesheetData, customerData, isProforma = false) {
  console.log("generating", isProforma ? "proforma invoice" : "invoice");
  
  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();
  
  // Embed standard fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Add a blank page
  const page = pdfDoc.addPage([595, 842]); // A4 size in points
  
  // Draw text
  const { height } = page.getSize();
  let y = height - 50;
  
  // Title (changes based on proforma status)
  const title = isProforma ? 'PROFORMA INVOICE' : 'INVOICE';
  page.drawText(title, {
    x: 50,
    y,
    size: 20,
    font: boldFont,
    color: isProforma ? rgb(0, 0, 0.5) : rgb(0, 0, 0) // Blue for proforma
  });
  y -= 30;

  // Invoice number and date
  page.drawText(`No: ${timesheetData.invoiceNumber || 'TBD'}`, { x: 50, y, size: 12, font });
  page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 450, y, size: 12, font });
  y -= 30;
  
  // From section (enhanced)
  page.drawText('From:', { x: 50, y, size: 12, font: boldFont });
  y -= 15;
  page.drawText('Your Company Name', { x: 50, y, size: 12, font });
  y -= 15;
  page.drawText('123 Business St', { x: 50, y, size: 12, font });
  y -= 15;
  page.drawText('City, Country', { x: 50, y, size: 12, font });
  y -= 30;
  
  // To section (enhanced)
  page.drawText('To:', { x: 50, y, size: 12, font: boldFont });
  y -= 15;
  page.drawText(`${customerData.fullName}`, { x: 50, y, size: 12, font });
  y -= 15;
  page.drawText(`${customerData.email}`, { x: 50, y, size: 12, font });
  if (customerData.address) {
    y -= 15;
    page.drawText(`${customerData.address}`, { x: 50, y, size: 12, font });
  }
  y -= 30;
  
  // Table headers
  page.drawText('Description', { x: 50, y, size: 12, font: boldFont });
  page.drawText('Amount', { x: 450, y, size: 12, font: boldFont });
  y -= 20;
  
  // Table row (enhanced for line items)
  page.drawText(`Consulting services for ${timesheetData.monthYear}`, { x: 50, y, size: 12, font });
  page.drawText(`$${timesheetData.totalAmount.toFixed(2)}`, { x: 450, y, size: 12, font });
  y -= 30;
  
  // Total line
  page.drawLine({
    start: { x: 50, y },
    end: { x: 550, y },
    thickness: 1,
  });
  y -= 10;
  
  // Total text
  page.drawText('Total', { x: 400, y, size: 12, font: boldFont });
  page.drawText(`$${timesheetData.totalAmount.toFixed(2)}`, { x: 450, y, size: 12, font: boldFont });
  y -= 30;

  // Proforma-specific additions
  if (isProforma) {
    page.drawText('TERMS & CONDITIONS:', { x: 50, y, size: 12, font: boldFont });
    y -= 20;
    page.drawText('- This is a proforma invoice, not a demand for payment', { x: 50, y, size: 10, font });
    y -= 15;
    page.drawText('- Valid for 30 days from date of issue', { x: 50, y, size: 10, font });
    y -= 15;
    page.drawText('- Payment due within 15 days of final invoice', { x: 50, y, size: 10, font });
  }
  
  // Save the PDF
  return await pdfDoc.save();
}