"use client";

import React, { useState } from "react";
import { Plus, ArrowLeftRight, History } from "lucide-react";
import QuickMovementModal from "./QuickMovementModal";
import MovementHistory from "./MovementHistory";
import { useRouter } from "next/navigation";

interface MovementPageContentProps {
  movements: any[];
  warehouses: any[];
  products: any[];
}

export default function MovementPageContent({
  movements,
  warehouses,
  products,
}: MovementPageContentProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Mouvements & Historique de Stock
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enregistrez les entrées fournisseurs, sorties clients, ajustements et transferts inter-entrepôts.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer un Mouvement</span>
        </button>
      </div>

      {/* History table */}
      <MovementHistory
        movements={movements}
        warehouses={warehouses}
        products={products}
      />

      {modalOpen && (
        <QuickMovementModal
          onClose={() => {
            setModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
