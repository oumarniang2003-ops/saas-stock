"use client";

import React, { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Sliders,
  ArrowLeftRight,
  Search,
  Filter,
  Calendar,
  User,
  Building,
} from "lucide-react";

interface MovementHistoryProps {
  movements: any[];
  warehouses: any[];
  products: any[];
}

export default function MovementHistory({
  movements,
  warehouses,
  products,
}: MovementHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("ALL");

  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      !searchTerm ||
      m.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.product?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.reason && m.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.reference && m.reference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === "ALL" || m.type === selectedType;

    const matchesWarehouse =
      selectedWarehouse === "ALL" ||
      m.warehouseId === selectedWarehouse ||
      m.fromWarehouseId === selectedWarehouse ||
      m.toWarehouseId === selectedWarehouse;

    return matchesSearch && matchesType && matchesWarehouse;
  });

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
    <div className="space-y-4">
      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par produit, motif, référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">Tous les types</option>
            <option value="IN">Entrées (+)</option>
            <option value="OUT">Sorties (-)</option>
            <option value="ADJUSTMENT">Ajustements (±)</option>
            <option value="TRANSFER">Transferts (⇄)</option>
          </select>

          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">Tous les entrepôts</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movements: mobile card list */}
      {filteredMovements.length === 0 ? (
        <div className="sm:hidden rounded-2xl bg-slate-900/80 border border-slate-800/80 p-10 text-center text-xs text-slate-400">
          Aucun mouvement ne correspond aux critères de filtre.
        </div>
      ) : (
        <div className="sm:hidden space-y-3">
          {filteredMovements.map((m) => {
            const config = badgeConfig[m.type as keyof typeof badgeConfig] || badgeConfig.IN;
            const Icon = config.icon;
            const dateStr = new Date(m.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={m.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 shadow-md"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] border ${config.bg}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{config.label}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">{dateStr}</span>
                </div>

                <div className="flex items-center gap-2.5 mb-3">
                  {m.product?.imageUrl ? (
                    <img
                      src={m.product.imageUrl}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover bg-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                      {m.product?.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-xs truncate">{m.product?.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{m.product?.sku}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400">Quantité</span>
                  <span
                    className={`font-bold ${
                      m.type === "IN"
                        ? "text-emerald-400"
                        : m.type === "OUT"
                        ? "text-rose-400"
                        : "text-indigo-300"
                    }`}
                  >
                    {config.sign}
                    {m.quantity} {m.product?.unit || "u"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400">Emplacement</span>
                  {m.type === "TRANSFER" ? (
                    <span className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400">{m.fromWarehouse?.name || "Source"}</span>
                      <ArrowRight className="w-3 h-3 text-indigo-400 inline" />
                      <span className="text-indigo-300 font-medium">{m.toWarehouse?.name || "Cible"}</span>
                    </span>
                  ) : (
                    <span className="text-slate-300">{m.warehouse?.name || "Entrepôt principal"}</span>
                  )}
                </div>

                {(m.reason || m.reference) && (
                  <div className="text-xs text-slate-300 mb-2">
                    {m.reason && <p>{m.reason}</p>}
                    {m.reference && (
                      <span className="text-[10px] text-indigo-400 font-mono">Réf: {m.reference}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Auteur</span>
                  <span>{m.user?.name || m.user?.email || "Système"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Movements Table: desktop only */}
      <div className="hidden sm:block rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-lg">
        {filteredMovements.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            Aucun mouvement ne correspond aux critères de filtre.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Date & Heure</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Article</th>
                  <th className="py-3.5 px-4 font-semibold">Quantité</th>
                  <th className="py-3.5 px-4 font-semibold">Emplacement / Trajet</th>
                  <th className="py-3.5 px-4 font-semibold">Motif / Référence</th>
                  <th className="py-3.5 px-4 font-semibold">Auteur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMovements.map((m) => {
                  const config = badgeConfig[m.type as keyof typeof badgeConfig] || badgeConfig.IN;
                  const Icon = config.icon;
                  const dateStr = new Date(m.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {dateStr}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] border ${config.bg}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{config.label}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {m.product?.imageUrl ? (
                            <img
                              src={m.product.imageUrl}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover bg-slate-800"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400">
                              {m.product?.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{m.product?.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{m.product?.sku}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold">
                        <span
                          className={
                            m.type === "IN"
                              ? "text-emerald-400"
                              : m.type === "OUT"
                              ? "text-rose-400"
                              : "text-indigo-300"
                          }
                        >
                          {config.sign}
                          {m.quantity} {m.product?.unit || "u"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {m.type === "TRANSFER" ? (
                          <span className="flex items-center gap-1 text-[11px]">
                            <span className="text-slate-400">{m.fromWarehouse?.name || "Source"}</span>
                            <ArrowRight className="w-3 h-3 text-indigo-400 inline" />
                            <span className="text-indigo-300 font-medium">{m.toWarehouse?.name || "Cible"}</span>
                          </span>
                        ) : (
                          <span>{m.warehouse?.name || "Entrepôt principal"}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <p>{m.reason || "-"}</p>
                        {m.reference && (
                          <span className="text-[10px] text-indigo-400 font-mono">
                            Réf: {m.reference}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {m.user?.name || m.user?.email || "Système"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
