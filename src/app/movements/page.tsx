import { requireTenant } from "@/lib/tenant";
import { getStockMovements } from "@/actions/movements";
import { getWarehouses } from "@/actions/warehouses";
import { getProducts } from "@/actions/products";
import AppShell from "@/components/layout/AppShell";
import MovementPageContent from "@/components/movements/MovementPageContent";

export const revalidate = 0;

export default async function MovementsPage() {
  const tenant = await requireTenant();
  const [movements, warehouses, products] = await Promise.all([
    getStockMovements({ limit: 150 }),
    getWarehouses(),
    getProducts(),
  ]);

  return (
    <AppShell
      organizationName={tenant.organizationName}
      userRole={tenant.role}
    >
      <MovementPageContent
        movements={movements}
        warehouses={warehouses}
        products={products}
      />
    </AppShell>
  );
}
