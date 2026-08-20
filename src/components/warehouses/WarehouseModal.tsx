"use client";

import React, { useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { createWarehouse, updateWarehouse } from "@/actions/warehouses";

interface WarehouseModalProps {
  warehouse?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WarehouseModal({
  warehouse,
  onClose,
  onSuccess,
}: WarehouseModalProps) {
  const isEditing = Boolean(warehouse);
  const [name, setName] = useState(warehouse?.name || "");
  const [location, setLocation] = useState(warehouse?.location || "");
  const [isDefault, setIsDefault] = useState(warehouse?.isDefault || false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom de l'entrepôt est obligatoire.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditing) {
        await updateWarehouse(warehouse.id, {
          name: name.trim(),
          location: location.trim() || undefined,
          isDefault,
        });
      } else {
        await createWarehouse({
          name: name.trim(),
          location: location.trim() || undefined,
          isDefault,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            {isEditing ? "Modifier l'entrepôt" : "Créer un nouvel entrepôt"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nom du site / entrepôt <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Dépôt Principal, Magasin Sud, Annexe..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Emplacement / Adresse / Zone
            </label>
            <input
              type="text"
              placeholder="Ex: 12 Rue des Artisans, Zone Industrielle Nord"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="isDefault" className="text-xs text-slate-300 cursor-pointer">
              Définir comme entrepôt par défaut pour les réceptions
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{submitting ? "Enregistrement..." : isEditing ? "Enregistrer" : "Créer l'entrepôt"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
