"use server";

import { requireTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type MovementInput = {
  type: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER";
  productId: string;
  quantity: number;
  reason?: string;
  reference?: string;
  warehouseId?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
};

export async function recordStockMovement(input: MovementInput) {
  const { organizationId, userId } = await requireTenant();

  if (input.quantity <= 0) {
    throw new Error("La quantité doit être strictement supérieure à 0.");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Verify product belongs to current tenant
    const product = await tx.product.findFirst({
      where: { id: input.productId, organizationId },
    });

    if (!product) {
      throw new Error("Produit introuvable ou non autorisé.");
    }

    if (input.type === "IN") {
      if (!input.warehouseId) throw new Error("Entrepôt requis pour une entrée de stock.");

      // Upsert stock record
      await tx.stock.upsert({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId: input.warehouseId,
          },
        },
        create: {
          productId: input.productId,
          warehouseId: input.warehouseId,
          quantity: input.quantity,
          organizationId,
        },
        update: {
          quantity: { increment: input.quantity },
        },
      });

      // Record movement
      const movement = await tx.stockMovement.create({
        data: {
          type: "IN",
          quantity: input.quantity,
          reason: input.reason || "Entrée de marchandise",
          reference: input.reference,
          productId: input.productId,
          warehouseId: input.warehouseId,
          userId,
          organizationId,
        },
      });

      revalidatePath("/movements");
      revalidatePath("/products");
      revalidatePath("/dashboard");
      return movement;
    }

    if (input.type === "OUT") {
      if (!input.warehouseId) throw new Error("Entrepôt requis pour une sortie de stock.");

      const currentStock = await tx.stock.findUnique({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId: input.warehouseId,
          },
        },
      });

      if (!currentStock || currentStock.quantity < input.quantity) {
        const available = currentStock ? currentStock.quantity : 0;
        throw new Error(
          `Stock insuffisant dans cet entrepôt. Disponible : ${available}, demandé : ${input.quantity}.`
        );
      }

      await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId: input.warehouseId,
          },
        },
        data: {
          quantity: { decrement: input.quantity },
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          type: "OUT",
          quantity: input.quantity,
          reason: input.reason || "Sortie de stock",
          reference: input.reference,
          productId: input.productId,
          warehouseId: input.warehouseId,
          userId,
          organizationId,
        },
      });

      revalidatePath("/movements");
      revalidatePath("/products");
      revalidatePath("/dashboard");
      return movement;
    }

    if (input.type === "ADJUSTMENT") {
      if (!input.warehouseId) throw new Error("Entrepôt requis pour un ajustement de stock.");

      // Quantity can be set directly
      const currentStock = await tx.stock.findUnique({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId: input.warehouseId,
          },
        },
      });

      const prevQty = currentStock ? currentStock.quantity : 0;
      const diff = input.quantity - prevQty;

      await tx.stock.upsert({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId: input.warehouseId,
          },
        },
        create: {
          productId: input.productId,
          warehouseId: input.warehouseId,
          quantity: input.quantity,
          organizationId,
        },
        update: {
          quantity: input.quantity,
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          type: "ADJUSTMENT",
          quantity: input.quantity,
          reason: input.reason || `Ajustement d'inventaire (${prevQty} → ${input.quantity})`,
          reference: input.reference,
          productId: input.productId,
          warehouseId: input.warehouseId,
          userId,
          organizationId,
        },
      });

      revalidatePath("/movements");
      revalidatePath("/products");
      revalidatePath("/dashboard");
      return movement;
    }

    if (input.type === "TRANSFER") {
      if (!input.fromWarehouseId || !input.toWarehouseId) {
        throw new Error("Entrepôts source et destination requis pour un transfert.");
      }

      if (input.fromWarehouseId === input.toWarehouseId) {
        throw new Error("L'entrepôt de destination doit être différent de la source.");
      }

      // Check source stock
      const sourceStock = await tx.stock.findUnique({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId: input.fromWarehouseId,
          },
        },
      });

      if (!sourceStock || sourceStock.quantity < input.quantity) {
        const available = sourceStock ? sourceStock.quantity : 0;
        throw new Error(
          `Stock insuffisant dans l'entrepôt source. Disponible : ${available}, demandé : ${input.quantity}.`
        );
      }

      // Decrement source
      await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId: input.fromWarehouseId,
          },
        },
        data: {
          quantity: { decrement: input.quantity },
        },
      });

      // Increment destination
      await tx.stock.upsert({
        where: {
          productId_warehouseId: {
            productId: input.productId,
            warehouseId: input.toWarehouseId,
          },
        },
        create: {
          productId: input.productId,
          warehouseId: input.toWarehouseId,
          quantity: input.quantity,
          organizationId,
        },
        update: {
          quantity: { increment: input.quantity },
        },
      });

      // Record movement
      const movement = await tx.stockMovement.create({
        data: {
          type: "TRANSFER",
          quantity: input.quantity,
          reason: input.reason || "Transfert inter-entrepôts",
          reference: input.reference,
          productId: input.productId,
          fromWarehouseId: input.fromWarehouseId,
          toWarehouseId: input.toWarehouseId,
          userId,
          organizationId,
        },
      });

      revalidatePath("/movements");
      revalidatePath("/products");
      revalidatePath("/dashboard");
      return movement;
    }

    throw new Error("Type de mouvement invalide.");
  });
}

export async function getStockMovements(options?: {
  productId?: string;
  warehouseId?: string;
  type?: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER";
  limit?: number;
}) {
  const { organizationId } = await requireTenant();

  const where: any = { organizationId };

  if (options?.productId) where.productId = options.productId;
  if (options?.type) where.type = options.type;
  if (options?.warehouseId) {
    where.OR = [
      { warehouseId: options.warehouseId },
      { fromWarehouseId: options.warehouseId },
      { toWarehouseId: options.warehouseId },
    ];
  }

  const movements = await prisma.stockMovement.findMany({
    where,
    include: {
      product: {
        include: {
          category: true,
        },
      },
      warehouse: true,
      fromWarehouse: true,
      toWarehouse: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit || 100,
  });

  return movements.map((m) => ({
    ...m,
    product: {
      ...m.product,
      price: Number(m.product.price),
      costPrice: Number(m.product.costPrice),
    },
  }));
}
