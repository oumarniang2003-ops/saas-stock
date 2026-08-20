"use server";

import { requireTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

export async function getDashboardMetrics() {
  const { organizationId, organizationName } = await requireTenant();

  // 1. Get all products with their stocks and categories
  const products = await prisma.product.findMany({
    where: { organizationId },
    include: {
      category: true,
      supplier: true,
      stocks: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  let totalStockValue = 0;
  let totalStockCost = 0;
  let totalItemsCount = 0;
  const lowStockProducts: any[] = [];
  const outOfStockProducts: any[] = [];

  const categoryMap = new Map<string, { name: string; count: number; value: number }>();

  for (const p of products) {
    const totalStock = p.stocks.reduce((acc, s) => acc + s.quantity, 0);
    const pPrice = Number(p.price);
    const pCost = Number(p.costPrice);

    totalItemsCount += totalStock;
    totalStockValue += totalStock * pPrice;
    totalStockCost += totalStock * pCost;

    const formattedProduct = {
      id: p.id,
      name: p.name,
      sku: p.sku,
      unit: p.unit,
      price: pPrice,
      lowStockThreshold: p.lowStockThreshold,
      totalStock,
      category: p.category?.name || "Non catégorisé",
      imageUrl: p.imageUrl,
    };

    if (totalStock === 0) {
      outOfStockProducts.push(formattedProduct);
    } else if (totalStock <= p.lowStockThreshold) {
      lowStockProducts.push(formattedProduct);
    }

    // Category breakdown
    const catName = p.category?.name || "Autre";
    const existingCat = categoryMap.get(catName) || { name: catName, count: 0, value: 0 };
    existingCat.count += totalStock;
    existingCat.value += totalStock * pPrice;
    categoryMap.set(catName, existingCat);
  }

  // 2. Warehouses summary
  const warehouses = await prisma.warehouse.findMany({
    where: { organizationId },
    include: {
      stocks: {
        include: {
          product: true,
        },
      },
    },
  });

  const warehouseStats = warehouses.map((w) => {
    const count = w.stocks.reduce((acc, s) => acc + s.quantity, 0);
    const value = w.stocks.reduce((acc, s) => acc + s.quantity * Number(s.product.price), 0);
    return {
      id: w.id,
      name: w.name,
      location: w.location,
      isDefault: w.isDefault,
      count,
      value,
    };
  });

  // 3. Recent 10 movements
  const recentMovements = await prisma.stockMovement.findMany({
    where: { organizationId },
    include: {
      product: true,
      warehouse: true,
      fromWarehouse: true,
      toWarehouse: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    organizationName,
    totalProducts: products.length,
    totalItemsCount,
    totalStockValue,
    totalStockCost,
    lowStockCount: lowStockProducts.length,
    outOfStockCount: outOfStockProducts.length,
    lowStockProducts: lowStockProducts.slice(0, 10),
    outOfStockProducts: outOfStockProducts.slice(0, 10),
    categoryStats: Array.from(categoryMap.values()),
    warehouseStats,
    recentMovements: recentMovements.map((m) => ({
      ...m,
      product: {
        ...m.product,
        price: Number(m.product.price),
      },
    })),
  };
}
