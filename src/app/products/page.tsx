import { requireTenant } from "@/lib/tenant";
import { getProducts, getCategories } from "@/actions/products";
import { getSuppliers } from "@/actions/suppliers";
import { getWarehouses } from "@/actions/warehouses";
import AppShell from "@/components/layout/AppShell";
import ProductList from "@/components/products/ProductList";

export const revalidate = 0;

export default async function ProductsPage() {
  const tenant = await requireTenant();
  const [products, categories, suppliers, warehouses] = await Promise.all([
    getProducts(),
    getCategories(),
    getSuppliers(),
    getWarehouses(),
  ]);

  return (
    <AppShell
      organizationName={tenant.organizationName}
      userRole={tenant.role}
    >
      <ProductList
        initialProducts={products}
        categories={categories}
        suppliers={suppliers}
        warehouses={warehouses}
      />
    </AppShell>
  );
}
