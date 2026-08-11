"use client";

import { jsPDF } from "jspdf";

interface PdfOptions {
  question: string;
  answer: string;
  sessionId?: string;
  fileName?: string;
}

/**
 * Client-side PDF generation for results.
 * Works reliably on Android / iPhone browsers.
 */
export async function generateResultPdf(options: PdfOptions) {
  const { question, answer, sessionId, fileName } = options;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  // Header
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Nox AI — Study Result", margin, 12);

  y = 28;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  doc.text(`Generated: ${dateStr}`, margin, y);
  if (sessionId) {
    doc.text(`Session: ${sessionId.slice(0, 20)}`, pageWidth - margin - 50, y);
  }
  y += 8;

  // Question
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text("Question / Request", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  const qLines = doc.splitTextToSize(question.slice(0, 1500), maxWidth);
  doc.text(qLines, margin, y);
  y += qLines.length * 5 + 6;

  if (fileName) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`File: ${fileName}`, margin, y);
    y += 7;
  }

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Answer
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text("Nox AI Response", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);

  // Simple markdown-ish stripping for PDF (basic)
  const cleanAnswer = answer
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\$\$(.*?)\$\$/g, "$1")
    .replace(/\$(.*?)\$/g, "$1");

  const aLines = doc.splitTextToSize(cleanAnswer, maxWidth);
  const lineHeight = 5;
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 0; i < aLines.length; i++) {
    if (y > pageHeight - 25) {
      doc.addPage();
      y = 20;
    }
    doc.text(aLines[i], margin, y);
    y += lineHeight;
  }

  // Footer on last page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "Nox AI · Your Personal AI Study Assistant · Owner: Noxious",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, {
      align: "right",
    });
  }

  doc.save(`nox-ai-result-${Date.now()}.pdf`);
}
