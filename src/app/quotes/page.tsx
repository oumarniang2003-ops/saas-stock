import { requireTenant } from "@/lib/tenant";
import { getQuotes } from "@/actions/quotes";
import { getProducts } from "@/actions/products";
import AppShell from "@/components/layout/AppShell";
import QuoteList from "@/components/quotes/QuoteList";

export const revalidate = 0;

export default async function QuotesPage() {
  const tenant = await requireTenant();
  const [quotes, products] = await Promise.all([getQuotes(), getProducts()]);

  return (
    <AppShell organizationName={tenant.organizationName} userRole={tenant.role}>
      <QuoteList quotes={quotes} products={products} organizationName={tenant.organizationName} />
    </AppShell>
  );
}
