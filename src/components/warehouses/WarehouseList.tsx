"use client";

import React, { useState } from "react";
import { Plus, Warehouse, MapPin, Boxes, DollarSign, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import WarehouseModal from "./WarehouseModal";
import { deleteWarehouse } from "@/actions/warehouses";
import { useRouter } from "next/navigation";

interface WarehouseListProps {
  warehouses: any[];
}

export default function WarehouseList({ warehouses }: WarehouseListProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Voulez-vous vraiment supprimer le site "${name}" ?`)) return;
    try {
      await deleteWarehouse(id);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Entrepôts & Dépôts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez vos différents sites de stockage, magasins et hangars de quincaillerie.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Entrepôt</span>
        </button>
      </div>

      {/* Grid of Warehouses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {warehouses.map((wh) => (
          <div
            key={wh.id}
            className="rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition p-5 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{wh.name}</h3>
                    {wh.location ? (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{wh.location}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-0.5">Emplacement non spécifié</p>
                    )}
                  </div>
                </div>

                {wh.isDefault && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold shrink-0">
                    Principal
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Articles en stock</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
                    <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                    {new Intl.NumberFormat("fr-FR").format(wh.totalQuantity)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Valeur estimée</span>
                  <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(wh.totalValue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {wh.totalUniqueProducts} référence(s) active(s)
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingWarehouse(wh)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Modifier l'entrepôt"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {!wh.isDefault && (
                  <button
                    onClick={() => handleDelete(wh.id, wh.name)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    title="Supprimer l'entrepôt"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <WarehouseModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {editingWarehouse && (
        <WarehouseModal
          warehouse={editingWarehouse}
          onClose={() => setEditingWarehouse(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
