"use server";

import { requireTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function getProducts(options?: {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  warehouseId?: string;
}) {
  const { organizationId } = await requireTenant();

  const where: Prisma.ProductWhereInput = {
    organizationId,
  };

  if (options?.categoryId) {
    where.categoryId = options.categoryId;
  }

  if (options?.supplierId) {
    where.supplierId = options.supplierId;
  }

  if (options?.search) {
    where.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { sku: { contains: options.search, mode: "insensitive" } },
      { description: { contains: options.search, mode: "insensitive" } },
      { barcode: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      supplier: true,
      stocks: {
        include: {
          warehouse: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => {
    const totalStock = p.stocks.reduce((acc, s) => acc + s.quantity, 0);
    const isLowStock = totalStock <= p.lowStockThreshold;
    const isOutOfStock = totalStock === 0;

    return {
      ...p,
      price: Number(p.price),
      costPrice: Number(p.costPrice),
      length: p.length !== null ? Number(p.length) : null,
      width: p.width !== null ? Number(p.width) : null,
      totalStock,
      isLowStock,
      isOutOfStock,
    };
  });
}

export async function getProductById(id: string) {
  const { organizationId } = await requireTenant();

  const product = await prisma.product.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      category: true,
      supplier: true,
      stocks: {
        include: {
          warehouse: true,
        },
      },
      stockMovements: {
        include: {
          warehouse: true,
          fromWarehouse: true,
          toWarehouse: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!product) return null;

  const totalStock = product.stocks.reduce((acc, s) => acc + s.quantity, 0);

  return {
    ...product,
    price: Number(product.price),
    costPrice: Number(product.costPrice),
    length: product.length !== null ? Number(product.length) : null,
    width: product.width !== null ? Number(product.width) : null,
    totalStock,
  };
}

export async function createProduct(data: {
  name: string;
  sku: string;
  description?: string;
  price: number;
  costPrice: number;
  lowStockThreshold: number;
  unit: string;
  length?: number;
  width?: number;
  barcode?: string;
  imageUrl?: string;
  categoryId?: string;
  supplierId?: string;
  initialStock?: {
    warehouseId: string;
    quantity: number;
  };
}) {
  const { organizationId, userId } = await requireTenant();

  return await prisma.$transaction(async (tx) => {
    // 1. Create product
    const product = await tx.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        price: new Prisma.Decimal(data.price),
        costPrice: new Prisma.Decimal(data.costPrice),
        lowStockThreshold: data.lowStockThreshold,
        unit: data.unit || "pièce",
        length: data.length !== undefined ? new Prisma.Decimal(data.length) : undefined,
        width: data.width !== undefined ? new Prisma.Decimal(data.width) : undefined,
        barcode: data.barcode || null,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId || null,
        supplierId: data.supplierId || null,
        organizationId,
      },
    });

    // 2. Add initial stock if specified
    if (data.initialStock && data.initialStock.warehouseId && data.initialStock.quantity > 0) {
      await tx.stock.upsert({
        where: {
          productId_warehouseId: {
            productId: product.id,
            warehouseId: data.initialStock.warehouseId,
          },
        },
        create: {
          productId: product.id,
          warehouseId: data.initialStock.warehouseId,
          quantity: data.initialStock.quantity,
          organizationId,
        },
        update: {
          quantity: { increment: data.initialStock.quantity },
        },
      });

      // Record movement
      await tx.stockMovement.create({
        data: {
          type: "IN",
          quantity: data.initialStock.quantity,
          reason: "Stock initial à la création du produit",
          productId: product.id,
          warehouseId: data.initialStock.warehouseId,
          userId,
          organizationId,
        },
      });
    }

    revalidatePath("/products");
    revalidatePath("/dashboard");
    revalidatePath("/movements");
    return product;
  });
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    sku?: string;
    description?: string;
    price?: number;
    costPrice?: number;
    lowStockThreshold?: number;
    unit?: string;
    length?: number;
    width?: number;
    barcode?: string | null;
    imageUrl?: string;
    categoryId?: string | null;
    supplierId?: string | null;
  }
) {
  const { organizationId } = await requireTenant();

  const product = await prisma.product.updateMany({
    where: {
      id,
      organizationId,
    },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.sku && { sku: data.sku }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: new Prisma.Decimal(data.price) }),
      ...(data.costPrice !== undefined && { costPrice: new Prisma.Decimal(data.costPrice) }),
      ...(data.lowStockThreshold !== undefined && { lowStockThreshold: data.lowStockThreshold }),
      ...(data.unit && { unit: data.unit }),
      ...(data.length !== undefined && { length: new Prisma.Decimal(data.length) }),
      ...(data.width !== undefined && { width: new Prisma.Decimal(data.width) }),
      ...(data.barcode !== undefined && { barcode: data.barcode || null }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.supplierId !== undefined && { supplierId: data.supplierId }),
    },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  revalidatePath("/dashboard");
  return product;
}

export async function deleteProduct(id: string) {
  const { organizationId } = await requireTenant();

  await prisma.product.deleteMany({
    where: {
      id,
      organizationId,
    },
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
  revalidatePath("/movements");
  return { success: true };
}

// Category Actions
export async function getCategories() {
  const { organizationId } = await requireTenant();
  return await prisma.category.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string, description?: string) {
  const { organizationId } = await requireTenant();
  const category = await prisma.category.create({
    data: {
      name,
      description,
      organizationId,
    },
  });

  revalidatePath("/products");
  return category;
}

export async function deleteCategory(id: string) {
  const { organizationId } = await requireTenant();
  await prisma.category.deleteMany({
    where: {
      id,
      organizationId,
    },
  });

  revalidatePath("/products");
  return { success: true };
}
