"use server";

import { requireTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getWarehouses() {
  const { organizationId } = await requireTenant();

  const warehouses = await prisma.warehouse.findMany({
    where: { organizationId },
    include: {
      stocks: {
        include: {
          product: true,
        },
      },
      _count: {
        select: {
          stocks: true,
          stockMovements: true,
        },
      },
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return warehouses.map((w) => {
    const totalQuantity = w.stocks.reduce((acc, s) => acc + s.quantity, 0);
    const totalValue = w.stocks.reduce(
      (acc, s) => acc + s.quantity * Number(s.product.price),
      0
    );

    return {
      ...w,
      totalQuantity,
      totalValue,
      totalUniqueProducts: w.stocks.filter((s) => s.quantity > 0).length,
    };
  });
}

export async function createWarehouse(data: {
  name: string;
  location?: string;
  isDefault?: boolean;
}) {
  const { organizationId } = await requireTenant();

  return await prisma.$transaction(async (tx) => {
    // If setting as default, unset existing default warehouses
    if (data.isDefault) {
      await tx.warehouse.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const warehouse = await tx.warehouse.create({
      data: {
        name: data.name,
        location: data.location,
        isDefault: data.isDefault || false,
        organizationId,
      },
    });

    revalidatePath("/warehouses");
    revalidatePath("/dashboard");
    return warehouse;
  });
}

export async function updateWarehouse(
  id: string,
  data: {
    name?: string;
    location?: string;
    isDefault?: boolean;
  }
) {
  const { organizationId } = await requireTenant();

  return await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.warehouse.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const warehouse = await tx.warehouse.updateMany({
      where: { id, organizationId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });

    revalidatePath("/warehouses");
    revalidatePath("/dashboard");
    return warehouse;
  });
}

export async function deleteWarehouse(id: string) {
  const { organizationId } = await requireTenant();

  // Check if warehouse has active stock
  const stocks = await prisma.stock.findMany({
    where: { warehouseId: id, organizationId, quantity: { gt: 0 } },
  });

  if (stocks.length > 0) {
    throw new Error("Impossible de supprimer un entrepôt contenant du stock actif.");
  }

  await prisma.warehouse.deleteMany({
    where: { id, organizationId },
  });

  revalidatePath("/warehouses");
  revalidatePath("/dashboard");
  return { success: true };
}
