"use client";

import React, { useState } from "react";
import { Plus, Truck, Mail, Phone, MapPin, User, Package, Edit2, Trash2 } from "lucide-react";
import SupplierModal from "./SupplierModal";
import { deleteSupplier } from "@/actions/suppliers";
import { useRouter } from "next/navigation";

interface SupplierListProps {
  suppliers: any[];
}

export default function SupplierList({ suppliers }: SupplierListProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Voulez-vous vraiment supprimer le fournisseur "${name}" ?`)) return;
    try {
      await deleteSupplier(id);
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
            Fournisseurs & Fabricants
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez votre carnet d'adresses de fabricants de portes, serrures et quincaillerie.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Fournisseur</span>
        </button>
      </div>

      {/* Grid of suppliers */}
      {suppliers.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center flex flex-col items-center justify-center">
          <Truck className="w-10 h-10 text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-white">Aucun fournisseur enregistré</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Ajoutez vos fournisseurs pour les associer à vos produits et simplifier vos commandes.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition cursor-pointer"
          >
            Ajouter un fournisseur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition p-5 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{s.name}</h3>
                    {s.contactName && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{s.contactName}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-300">
                  {s.email && (
                    <p className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a href={`mailto:${s.email}`} className="hover:text-indigo-400 transition truncate">
                        {s.email}
                      </a>
                    </p>
                  )}

                  {s.phone && (
                    <p className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a href={`tel:${s.phone}`} className="hover:text-indigo-400 transition">
                        {s.phone}
                      </a>
                    </p>
                  )}

                  {s.address && (
                    <p className="flex items-start gap-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{s.address}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-slate-500" />
                  <span>{s._count?.products || 0} produit(s) lié(s)</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingSupplier(s)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Modifier le fournisseur"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    title="Supprimer le fournisseur"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <SupplierModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {editingSupplier && (
        <SupplierModal
          supplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
