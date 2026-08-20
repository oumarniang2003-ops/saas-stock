import { requireTenant } from "@/lib/tenant";
import { getWarehouses } from "@/actions/warehouses";
import AppShell from "@/components/layout/AppShell";
import WarehouseList from "@/components/warehouses/WarehouseList";

export const revalidate = 0;

export default async function WarehousesPage() {
  const tenant = await requireTenant();
  const warehouses = await getWarehouses();

  return (
    <AppShell
      organizationName={tenant.organizationName}
      userRole={tenant.role}
    >
      <WarehouseList warehouses={warehouses} />
    </AppShell>
  );
}
