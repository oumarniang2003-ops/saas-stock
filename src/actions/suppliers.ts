"use server";

import { requireTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  const { organizationId } = await requireTenant();

  const suppliers = await prisma.supplier.findMany({
    where: { organizationId },
    include: {
      products: {
        select: { id: true, name: true, sku: true },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return suppliers;
}

export async function createSupplier(data: {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  const { organizationId } = await requireTenant();

  const supplier = await prisma.supplier.create({
    data: {
      name: data.name,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      organizationId,
    },
  });

  revalidatePath("/suppliers");
  revalidatePath("/products");
  return supplier;
}

export async function updateSupplier(
  id: string,
  data: {
    name?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
  }
) {
  const { organizationId } = await requireTenant();

  const supplier = await prisma.supplier.updateMany({
    where: { id, organizationId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.contactName !== undefined && { contactName: data.contactName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address !== undefined && { address: data.address }),
    },
  });

  revalidatePath("/suppliers");
  return supplier;
}

export async function deleteSupplier(id: string) {
  const { organizationId } = await requireTenant();

  await prisma.supplier.deleteMany({
    where: { id, organizationId },
  });

  revalidatePath("/suppliers");
  revalidatePath("/products");
  return { success: true };
}
