"use server";

import { requireTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export interface QuoteItemInput {
  productId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuoteInput {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  notes?: string;
  validUntil?: string;
  items: QuoteItemInput[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeQuote(q: any) {
  const items = q.items.map((item: any) => ({
    ...item,
    unitPrice: Number(item.unitPrice),
  }));

  const total = items.reduce(
    (acc: number, item: any) => acc + item.unitPrice * item.quantity,
    0
  );

  return {
    ...q,
    items,
    total,
  };
}

export async function getQuotes() {
  const { organizationId } = await requireTenant();

  const quotes = await prisma.quote.findMany({
    where: { organizationId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return quotes.map(serializeQuote);
}

export async function getQuoteById(id: string) {
  const { organizationId } = await requireTenant();

  const quote = await prisma.quote.findFirst({
    where: { id, organizationId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!quote) return null;

  return serializeQuote(quote);
}

async function nextQuoteNumber(
  tx: Prisma.TransactionClient,
  organizationId: string
) {
  const year = new Date().getFullYear();
  const prefix = `DEV-${year}-`;

  const count = await tx.quote.count({
    where: {
      organizationId,
      number: { startsWith: prefix },
    },
  });

  return `${prefix}${String(count + 1).padStart(3, "0")}`;
}

export async function createQuote(data: QuoteInput) {
  const { organizationId } = await requireTenant();

  if (!data.clientName?.trim()) {
    throw new Error("Le nom du client est obligatoire.");
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("Le devis doit contenir au moins un article.");
  }

  const quote = await prisma.$transaction(async (tx) => {
    const number = await nextQuoteNumber(tx, organizationId);

    return tx.quote.create({
      data: {
        number,
        clientName: data.clientName.trim(),
        clientEmail: data.clientEmail || undefined,
        clientPhone: data.clientPhone || undefined,
        clientAddress: data.clientAddress || undefined,
        notes: data.notes || undefined,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        organizationId,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
          })),
        },
      },
      include: { items: true },
    });
  });

  revalidatePath("/quotes");
  return serializeQuote(quote);
}

export async function updateQuote(id: string, data: QuoteInput) {
  const { organizationId } = await requireTenant();

  if (!data.clientName?.trim()) {
    throw new Error("Le nom du client est obligatoire.");
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("Le devis doit contenir au moins un article.");
  }

  const existing = await prisma.quote.findFirst({
    where: { id, organizationId },
  });

  if (!existing) {
    throw new Error("Devis introuvable.");
  }

  const quote = await prisma.$transaction(async (tx) => {
    await tx.quoteItem.deleteMany({ where: { quoteId: id } });

    return tx.quote.update({
      where: { id },
      data: {
        clientName: data.clientName.trim(),
        clientEmail: data.clientEmail || undefined,
        clientPhone: data.clientPhone || undefined,
        clientAddress: data.clientAddress || undefined,
        notes: data.notes || undefined,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
          })),
        },
      },
      include: { items: true },
    });
  });

  revalidatePath("/quotes");
  return serializeQuote(quote);
}

export async function updateQuoteStatus(
  id: string,
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED"
) {
  const { organizationId } = await requireTenant();

  await prisma.quote.updateMany({
    where: { id, organizationId },
    data: { status },
  });

  revalidatePath("/quotes");
}

export async function deleteQuote(id: string) {
  const { organizationId } = await requireTenant();

  await prisma.quote.deleteMany({
    where: { id, organizationId },
  });

  revalidatePath("/quotes");
}
