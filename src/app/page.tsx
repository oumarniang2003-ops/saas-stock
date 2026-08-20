import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Boxes, ArrowRight, ShieldCheck, Warehouse, ArrowLeftRight, CheckCircle2, TrendingUp } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shadow-lg shadow-indigo-500/10">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">StockMaster SaaS</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Connexion
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
            >
              <span>Essai Gratuit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SaaS Multi-Tenant & Transactions Atomiques</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight">
          La gestion de stock moderne pour la{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
            quincaillerie et le bâtiment
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl">
          Suivez vos portes, serrures, accessoires et matériaux en temps réel.
          Multi-entrepôts, valorisation financière, alertes de stock bas et traçabilité inviolable.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition flex items-center justify-center gap-2"
          >
            <span>Démarrer maintenant</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/sign-in"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm transition flex items-center justify-center"
          >
            Accéder à mon espace
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Gestion de Produits & Variantes</h3>
            <p className="text-xs text-slate-400 mt-2">
              SKU uniques, prix d'achat/vente, catégories personnalisées, seuils d'alerte et photos de produits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Transactions Atomiques</h3>
            <p className="text-xs text-slate-400 mt-2">
              Entrées, sorties, inventaires et transferts sécurisés par Prisma sans risque de désynchronisation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Warehouse className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Multi-Entrepôts & Fournisseurs</h3>
            <p className="text-xs text-slate-400 mt-2">
              Répartissez vos marchandises sur plusieurs dépôts et suivez vos fournisseurs avec facilité.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} StockMaster SaaS. Tous droits réservés.
      </footer>
    </div>
  );
}
