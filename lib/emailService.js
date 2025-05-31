import nodemailer from 'nodemailer';
import { generateInvoicePDF } from './pdfService';
import fs from 'fs'; //
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendInvoiceEmail(timesheet, customer, isProforma = true) {
  try {
    console.log('Attempting to send email to:', customer.email);
    console.log('Using email service:', process.env.EMAIL_USER);

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(timesheet, customer, isProforma);
    
    // Save PDF to disk for debugging
    fs.writeFileSync(isProforma ? 'debug-proforma.pdf' : 'debug-invoice.pdf', pdfBuffer);
    console.log('PDF saved to disk for verification');

    // Email options
    const mailOptions = {
      from: `"Your Company" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject: isProforma 
        ? `Proforma Invoice for ${timesheet.monthYear}` 
        : `Invoice for ${timesheet.monthYear}`,
      html: `
        <p>Dear ${customer.fullName},</p>
        <p>Please find attached your ${isProforma ? 'proforma invoice' : 'invoice'} for ${timesheet.monthYear}.</p>
        <p>Amount: $${timesheet.totalAmount.toFixed(2)}</p>
        ${isProforma ? '<p><em>This is a preliminary invoice for approval.</em></p>' : ''}
        <p>Thank you for your business!</p>
      `,
      attachments: [{
        filename: isProforma 
          ? `Proforma_Invoice_${timesheet._id.toString().slice(-6)}.pdf`
          : `Invoice_${timesheet._id.toString().slice(-6)}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    
    return info;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
}