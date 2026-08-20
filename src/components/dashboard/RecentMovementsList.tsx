"use client";

import React from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Sliders, ArrowLeftRight, ArrowRight, Clock } from "lucide-react";

interface RecentMovementsListProps {
  movements: any[];
}

export default function RecentMovementsList({ movements }: RecentMovementsListProps) {
  if (!movements || movements.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center justify-center text-center py-10">
        <Clock className="w-8 h-8 text-slate-500 mb-2" />
        <h3 className="text-sm font-semibold text-white">Aucun mouvement récent</h3>
        <p className="text-xs text-slate-400 mt-1">
          Les réceptions, ventes et ajustements apparaîtront ici en temps réel.
        </p>
      </div>
    );
  }

  const badgeConfig = {
    IN: {
      label: "Entrée",
      icon: ArrowDownRight,
      bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
      sign: "+",
    },
    OUT: {
      label: "Sortie",
      icon: ArrowUpRight,
      bg: "bg-rose-500/15 border-rose-500/30 text-rose-400",
      sign: "-",
    },
    ADJUSTMENT: {
      label: "Ajustement",
      icon: Sliders,
      bg: "bg-amber-500/15 border-amber-500/30 text-amber-400",
      sign: "±",
    },
    TRANSFER: {
      label: "Transfert",
      icon: ArrowLeftRight,
      bg: "bg-indigo-500/15 border-indigo-500/30 text-indigo-400",
      sign: "⇄",
    },
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Derniers Mouvements de Stock</h3>
        </div>
        <Link
          href="/movements"
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
        >
          <span>Historique complet</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {movements.map((m) => {
          const config = badgeConfig[m.type as keyof typeof badgeConfig] || badgeConfig.IN;
          const Icon = config.icon;
          const dateStr = new Date(m.createdAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={m.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${config.bg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {m.product?.name || "Produit inconnu"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {m.type === "TRANSFER"
                      ? `${m.fromWarehouse?.name || "Source"} → ${m.toWarehouse?.name || "Cible"}`
                      : m.warehouse?.name || "Entrepôt principal"}
                    {m.reason ? ` • ${m.reason}` : ""}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={`text-xs font-bold ${
                  m.type === "IN" ? "text-emerald-400" : m.type === "OUT" ? "text-rose-400" : "text-indigo-300"
                }`}>
                  {config.sign}{m.quantity} {m.product?.unit || "u"}
                </p>
                <p className="text-[10px] text-slate-400">{dateStr}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
