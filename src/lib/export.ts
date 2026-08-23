"use client";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatXOF(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(value);
}

function todayLabel() {
  return new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function downloadWorkbook(rows: Record<string, unknown>[], sheetName: string, filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

function downloadPdfTable(
  title: string,
  head: string[],
  body: (string | number)[][],
  filename: string
) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text(`Généré le ${todayLabel()}`, 14, 21);

  autoTable(doc, {
    head: [head],
    body,
    startY: 26,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  doc.save(filename);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportProductsToExcel(products: any[]) {
  const rows = products.map((p) => ({
    Nom: p.name,
    SKU: p.sku,
    "Code-barres": p.barcode || "",
    Catégorie: p.category?.name || "",
    Fournisseur: p.supplier?.name || "",
    "Prix Vente (FCFA)": p.price,
    "Prix Achat (FCFA)": p.costPrice,
    "Stock Total": p.totalStock,
    Unité: p.unit,
    "Valeur Stock (FCFA)": p.price * p.totalStock,
  }));
  downloadWorkbook(rows, "Inventaire", `inventaire-${Date.now()}.xlsx`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportProductsToPDF(products: any[]) {
  const totalValue = products.reduce((acc, p) => acc + p.price * p.totalStock, 0);
  const head = ["Produit", "SKU", "Catégorie", "Stock", "Prix Vente", "Valeur"];
  const body = products.map((p) => [
    p.name,
    p.sku,
    p.category?.name || "-",
    `${p.totalStock} ${p.unit}`,
    formatXOF(p.price),
    formatXOF(p.price * p.totalStock),
  ]);
  body.push(["", "", "", "", "TOTAL", formatXOF(totalValue)]);

  downloadPdfTable("Inventaire des produits", head, body, `inventaire-${Date.now()}.pdf`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportMovementsToExcel(movements: any[]) {
  const rows = movements.map((m) => ({
    Date: new Date(m.createdAt).toLocaleString("fr-FR"),
    Type: m.type,
    Produit: m.product?.name || "",
    SKU: m.product?.sku || "",
    Quantité: m.quantity,
    Entrepôt:
      m.type === "TRANSFER"
        ? `${m.fromWarehouse?.name || ""} -> ${m.toWarehouse?.name || ""}`
        : m.warehouse?.name || "",
    Motif: m.reason || "",
    Référence: m.reference || "",
    Auteur: m.user?.name || m.user?.email || "",
  }));
  downloadWorkbook(rows, "Mouvements", `mouvements-${Date.now()}.xlsx`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportMovementsToPDF(movements: any[]) {
  const head = ["Date", "Type", "Produit", "Qté", "Entrepôt", "Motif"];
  const body = movements.map((m) => [
    new Date(m.createdAt).toLocaleDateString("fr-FR"),
    m.type,
    m.product?.name || "",
    String(m.quantity),
    m.type === "TRANSFER"
      ? `${m.fromWarehouse?.name || ""} -> ${m.toWarehouse?.name || ""}`
      : m.warehouse?.name || "",
    m.reason || "-",
  ]);
  downloadPdfTable("Historique des mouvements", head, body, `mouvements-${Date.now()}.pdf`);
}
