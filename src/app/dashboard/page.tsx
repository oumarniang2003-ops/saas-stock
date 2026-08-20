import { requireTenant } from "@/lib/tenant";
import { getDashboardMetrics } from "@/actions/dashboard";
import AppShell from "@/components/layout/AppShell";
import StatCards from "@/components/dashboard/StatCards";
import LowStockAlerts from "@/components/dashboard/LowStockAlerts";
import RecentMovementsList from "@/components/dashboard/RecentMovementsList";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";

export const revalidate = 0; // dynamic data for inventory

export default async function DashboardPage() {
  const tenant = await requireTenant();
  const metrics = await getDashboardMetrics();

  return (
    <AppShell
      organizationName={tenant.organizationName}
      userRole={tenant.role}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Aperçu en direct de votre inventaire, valorisation et alertes de réapprovisionnement.
            </p>
          </div>
        </div>

        {/* 1. KPIs Cards */}
        <StatCards metrics={metrics} />

        {/* 2. Middle Grid: Low Stock Alerts & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LowStockAlerts products={metrics.lowStockProducts} />
          </div>
          <div className="lg:col-span-1">
            <CategoryBreakdown
              categories={metrics.categoryStats}
              totalValue={metrics.totalStockValue}
            />
          </div>
        </div>

        {/* 3. Recent Movements */}
        <div>
          <RecentMovementsList movements={metrics.recentMovements} />
        </div>
      </div>
    </AppShell>
  );
}
