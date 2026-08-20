import { requireTenant } from "@/lib/tenant";
import { getSuppliers } from "@/actions/suppliers";
import AppShell from "@/components/layout/AppShell";
import SupplierList from "@/components/suppliers/SupplierList";

export const revalidate = 0;

export default async function SuppliersPage() {
  const tenant = await requireTenant();
  const suppliers = await getSuppliers();

  return (
    <AppShell
      organizationName={tenant.organizationName}
      userRole={tenant.role}
    >
      <SupplierList suppliers={suppliers} />
    </AppShell>
  );
}
