"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { createCategory, deleteCategory } from "@/actions/products";

interface CategoryModalProps {
  categories: any[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function CategoryModal({ categories, onClose, onRefresh }: CategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await createCategory(name.trim(), description.trim() || undefined);
      setName("");
      setDescription("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Gérer les Catégories</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Add Category Form */}
          <form onSubmit={handleCreate} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-white">Ajouter une catégorie</h3>
            <div>
              <input
                type="text"
                placeholder="Nom (ex: Portes Coupe-Feu, Serrures Multipoints...)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Description facultative"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Ajouter la catégorie</span>
            </button>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* List of existing categories */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Catégories Existantes ({categories.length})
            </h3>
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              {categories.map((cat) => (
                <div key={cat.id} className="p-3 flex items-center justify-between hover:bg-slate-900/50 transition">
                  <div>
                    <p className="text-xs font-semibold text-white">{cat.name}</p>
                    {cat.description && <p className="text-[11px] text-slate-400">{cat.description}</p>}
                    <span className="text-[10px] text-slate-500">{cat._count?.products || 0} produit(s) associé(s)</span>
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Supprimer la catégorie"
                  >
                    {deletingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
