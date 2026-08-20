"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Plus, CheckCircle2 } from "lucide-react";
import QuickMovementModal from "../movements/QuickMovementModal";

interface LowStockAlertsProps {
  products: any[];
}

export default function LowStockAlerts({ products }: LowStockAlertsProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  if (!products || products.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center justify-center text-center py-10">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white">Niveau de stock optimal</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Aucun produit n'est actuellement sous son seuil d'alerte. Vos approvisionnements sont à jour.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-white">Produits à Réapprovisionner</h3>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            {products.length}
          </span>
        </div>
        <Link
          href="/products"
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
        >
          <span>Voir tout</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto -mx-6 px-6 flex-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-3 font-medium">Produit</th>
              <th className="pb-3 font-medium">Catégorie</th>
              <th className="pb-3 font-medium">Stock Actuel</th>
              <th className="pb-3 font-medium">Seuil Min</th>
              <th className="pb-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-8 h-8 rounded-lg object-cover bg-slate-800"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-slate-300">{p.category}</td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                      p.totalStock === 0
                        ? "bg-rose-500/15 border border-rose-500/30 text-rose-400"
                        : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                    }`}
                  >
                    {p.totalStock} {p.unit}
                  </span>
                </td>
                <td className="py-3 text-slate-400">
                  {p.lowStockThreshold} {p.unit}
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => setSelectedProduct(p.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-medium text-[11px] transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Entrée</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedProduct && (
        <QuickMovementModal
          onClose={() => setSelectedProduct(null)}
          defaultProductId={selectedProduct}
          defaultType="IN"
        />
      )}
    </div>
  );
}
