"use client";

import React from "react";
import { DollarSign, Package, AlertTriangle, Boxes, TrendingUp, Warehouse } from "lucide-react";

interface StatCardsProps {
  metrics: {
    totalStockValue: number;
    totalStockCost: number;
    totalProducts: number;
    totalItemsCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    warehouseStats: any[];
  };
}

export default function StatCards({ metrics }: StatCardsProps) {
  const marginPotential = metrics.totalStockValue - metrics.totalStockCost;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Stock Value */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Valeur du Stock
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(metrics.totalStockValue)}
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
          <span className="text-emerald-400 font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            +{(marginPotential > 0 ? (marginPotential / (metrics.totalStockCost || 1)) * 100 : 0).toFixed(0)}%
          </span>
          <span>marge brute théorique</span>
        </p>
      </div>

      {/* 2. Total Articles / Items */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quantité en Stock
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Boxes className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {new Intl.NumberFormat("fr-FR").format(metrics.totalItemsCount)}{" "}
          <span className="text-sm font-normal text-slate-400">unités</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Sur <span className="text-indigo-400 font-semibold">{metrics.totalProducts}</span> références enregistrées
        </p>
      </div>

      {/* 3. Low Stock Alert */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Alertes Stock Faible
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            metrics.lowStockCount > 0
              ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
              : "bg-slate-800 text-slate-400"
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {metrics.lowStockCount}{" "}
          <span className="text-sm font-normal text-slate-400">produit(s)</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {metrics.outOfStockCount > 0 ? (
            <span className="text-rose-400 font-medium">Dont {metrics.outOfStockCount} en rupture totale</span>
          ) : (
            <span className="text-slate-400">Sous le seuil d'alerte configuré</span>
          )}
        </p>
      </div>

      {/* 4. Active Warehouses */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Entrepôts Actifs
          </span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Warehouse className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {metrics.warehouseStats.length}{" "}
          <span className="text-sm font-normal text-slate-400">sites</span>
        </div>
        <p className="text-xs text-slate-400 mt-2 truncate">
          {metrics.warehouseStats.find((w) => w.isDefault)?.name || "Tous dépôts opérationnels"}
        </p>
      </div>
    </div>
  );
}
