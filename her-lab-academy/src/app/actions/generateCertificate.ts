'use server';

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const PRIMARY = rgb(0.91, 0.38, 0.17);   // #E8612C
const SECONDARY = rgb(0.176, 0.416, 0.31); // #2D6A4F
const CREAM = rgb(0.992, 0.965, 0.933);   // #FDF6EE
const DARK = rgb(0.102, 0.102, 0.102);    // #1A1A1A

export async function generateCertificate({
  studentName,
  courseName,
  completionDate,
  certificateId,
}: {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  // Cream background
  page.drawRectangle({ x: 0, y: 0, width, height, color: CREAM });

  // Outer border — orange
  const borderPad = 18;
  page.drawRectangle({ x: borderPad, y: borderPad, width: width - borderPad * 2, height: height - borderPad * 2, borderColor: PRIMARY, borderWidth: 4, color: CREAM });

  // Inner border — green
  const innerPad = 28;
  page.drawRectangle({ x: innerPad, y: innerPad, width: width - innerPad * 2, height: height - innerPad * 2, borderColor: SECONDARY, borderWidth: 1.5, color: CREAM });

  // Top accent bar
  page.drawRectangle({ x: innerPad, y: height - innerPad - 6, width: width - innerPad * 2, height: 6, color: PRIMARY });

  // Bottom accent bar
  page.drawRectangle({ x: innerPad, y: innerPad, width: width - innerPad * 2, height: 6, color: SECONDARY });

  // Corner decorations
  const cornerSize = 30;
  const corners = [
    { x: innerPad, y: height - innerPad - cornerSize },
    { x: width - innerPad - cornerSize, y: height - innerPad - cornerSize },
    { x: innerPad, y: innerPad + 6 },
    { x: width - innerPad - cornerSize, y: innerPad + 6 },
  ];
  corners.forEach(c => {
    page.drawRectangle({ x: c.x, y: c.y, width: cornerSize, height: cornerSize, color: rgb(0.91, 0.38, 0.17), opacity: 0.12 });
  });

  // Header: HER Lab University
  page.drawText('HER LAB UNIVERSITY', {
    x: width / 2 - helveticaBold.widthOfTextAtSize('HER LAB UNIVERSITY', 13) / 2,
    y: height - 80,
    size: 13,
    font: helveticaBold,
    color: SECONDARY,
  });

  // Subtitle: Perur Rays of Hope
  const sub = 'Perur Rays of Hope CBO — West Pokot, Kenya';
  page.drawText(sub, {
    x: width / 2 - helvetica.widthOfTextAtSize(sub, 9) / 2,
    y: height - 98,
    size: 9,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Divider line
  page.drawLine({ start: { x: 120, y: height - 110 }, end: { x: width - 120, y: height - 110 }, thickness: 0.8, color: PRIMARY, opacity: 0.4 });

  // "Certificate of Completion"
  const certTitle = 'Certificate of Completion';
  page.drawText(certTitle, {
    x: width / 2 - timesRomanBold.widthOfTextAtSize(certTitle, 36) / 2,
    y: height - 165,
    size: 36,
    font: timesRomanBold,
    color: PRIMARY,
  });

  // "This is to certify that"
  const certify = 'This is to certify that';
  page.drawText(certify, {
    x: width / 2 - helvetica.widthOfTextAtSize(certify, 12) / 2,
    y: height - 205,
    size: 12,
    font: helvetica,
    color: DARK,
  });

  // Student Name
  page.drawText(studentName, {
    x: width / 2 - timesRomanBold.widthOfTextAtSize(studentName, 42) / 2,
    y: height - 260,
    size: 42,
    font: timesRomanBold,
    color: SECONDARY,
  });

  // Name underline
  const nameWidth = timesRomanBold.widthOfTextAtSize(studentName, 42);
  page.drawLine({
    start: { x: width / 2 - nameWidth / 2, y: height - 268 },
    end: { x: width / 2 + nameWidth / 2, y: height - 268 },
    thickness: 1.5,
    color: SECONDARY,
    opacity: 0.5,
  });

  // "has successfully completed"
  const completed = 'has successfully completed the course';
  page.drawText(completed, {
    x: width / 2 - helvetica.widthOfTextAtSize(completed, 12) / 2,
    y: height - 295,
    size: 12,
    font: helvetica,
    color: DARK,
  });

  // Course Name
  page.drawText(courseName, {
    x: width / 2 - timesRomanBold.widthOfTextAtSize(courseName, 26) / 2,
    y: height - 335,
    size: 26,
    font: timesRomanBold,
    color: PRIMARY,
  });

  // Completion date
  const dateText = `Completed on: ${completionDate}`;
  page.drawText(dateText, {
    x: width / 2 - helvetica.widthOfTextAtSize(dateText, 11) / 2,
    y: height - 365,
    size: 11,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Divider
  page.drawLine({ start: { x: 120, y: height - 385 }, end: { x: width - 120, y: height - 385 }, thickness: 0.8, color: SECONDARY, opacity: 0.3 });

  // Signature lines
  const sigY = height - 430;
  // Left signature
  page.drawLine({ start: { x: 130, y: sigY }, end: { x: 310, y: sigY }, thickness: 1, color: DARK, opacity: 0.4 });
  page.drawText('Director / Principal', { x: 165, y: sigY - 16, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('Perur Rays of Hope CBO', { x: 148, y: sigY - 28, size: 8, font: helvetica, color: rgb(0.5, 0.5, 0.5) });

  // Right signature
  page.drawLine({ start: { x: width - 310, y: sigY }, end: { x: width - 130, y: sigY }, thickness: 1, color: DARK, opacity: 0.4 });
  page.drawText('Course Instructor', { x: width - 280, y: sigY - 16, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('HER Lab University', { x: width - 265, y: sigY - 28, size: 8, font: helvetica, color: rgb(0.5, 0.5, 0.5) });

  // Certificate ID
  const idText = `Certificate ID: ${certificateId}`;
  page.drawText(idText, {
    x: width / 2 - helvetica.widthOfTextAtSize(idText, 8) / 2,
    y: innerPad + 18,
    size: 8,
    font: helvetica,
    color: rgb(0.6, 0.6, 0.6),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
