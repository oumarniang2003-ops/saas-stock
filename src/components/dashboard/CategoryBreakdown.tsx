"use client";

import React from "react";
import { PieChart, Layers } from "lucide-react";

interface CategoryBreakdownProps {
  categories: { name: string; count: number; value: number }[];
  totalValue: number;
}

export default function CategoryBreakdown({ categories, totalValue }: CategoryBreakdownProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  const sorted = [...categories].sort((a, b) => b.value - a.value);

  const colors = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-cyan-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-rose-500",
  ];

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Répartition par Catégorie</h3>
      </div>

      <div className="space-y-4 flex-1">
        {sorted.map((cat, idx) => {
          const percentage = totalValue > 0 ? (cat.value / totalValue) * 100 : 0;
          const colorClass = colors[idx % colors.length];

          return (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">{cat.name}</span>
                <span className="text-slate-400 font-mono">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cat.value)}{" "}
                  <span className="text-slate-400">({percentage.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className={`h-full rounded-full ${colorClass} transition-all duration-500`}
                  style={{ width: `${Math.max(percentage, 3)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                {cat.count} unité(s) en stock
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
