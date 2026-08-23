"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatXOF(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(value);
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function downloadQuotePdf(quote: any, organizationName: string) {
  const doc = new jsPDF();

  // Title & organization
  doc.setFontSize(20);
  doc.setTextColor(20);
  doc.text("DEVIS", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(organizationName, 14, 27);

  // Quote metadata (right aligned)
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(10);
  doc.setTextColor(20);
  doc.text(`N° ${quote.number}`, pageWidth - 14, 20, { align: "right" });
  doc.setTextColor(100);
  doc.text(`Émis le ${formatDate(quote.createdAt)}`, pageWidth - 14, 26, { align: "right" });
  if (quote.validUntil) {
    doc.text(`Valable jusqu'au ${formatDate(quote.validUntil)}`, pageWidth - 14, 32, {
      align: "right",
    });
  }

  // Client block
  let clientY = 42;
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text("CLIENT", 14, clientY);
  clientY += 6;

  doc.setFontSize(10);
  doc.setTextColor(20);
  doc.text(quote.clientName, 14, clientY);
  clientY += 5;

  if (quote.clientPhone) {
    doc.setTextColor(100);
    doc.text(quote.clientPhone, 14, clientY);
    clientY += 5;
  }
  if (quote.clientEmail) {
    doc.setTextColor(100);
    doc.text(quote.clientEmail, 14, clientY);
    clientY += 5;
  }
  if (quote.clientAddress) {
    doc.setTextColor(100);
    doc.text(quote.clientAddress, 14, clientY);
    clientY += 5;
  }

  // Items table
  const head = ["Description", "Qté", "Prix unitaire", "Total"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = quote.items.map((item: any) => [
    item.description,
    String(item.quantity),
    formatXOF(item.unitPrice),
    formatXOF(item.unitPrice * item.quantity),
  ]);

  autoTable(doc, {
    head: [head],
    body,
    startY: clientY + 6,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [79, 70, 229] },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || clientY + 6;

  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text(`Total: ${formatXOF(quote.total)}`, pageWidth - 14, finalY + 10, { align: "right" });

  // Notes
  if (quote.notes) {
    let notesY = finalY + 22;
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229);
    doc.text("Notes", 14, notesY);
    notesY += 5;
    doc.setTextColor(100);
    const noteLines = doc.splitTextToSize(quote.notes, pageWidth - 28);
    doc.text(noteLines, 14, notesY);
  }

  doc.save(`${quote.number}.pdf`);
}
