"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Boxes,
  LayoutGrid,
  List,
  Layers,
  ArrowDownRight,
  Package,
} from "lucide-react";
import ProductModal from "./ProductModal";
import CategoryModal from "./CategoryModal";
import QuickMovementModal from "../movements/QuickMovementModal";
import { deleteProduct } from "@/actions/products";
import { useRouter } from "next/navigation";

interface ProductListProps {
  initialProducts: any[];
  categories: any[];
  suppliers: any[];
  warehouses: any[];
}

export default function ProductList({
  initialProducts,
  categories,
  suppliers,
  warehouses,
}: ProductListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "LOW" | "OUT">("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [quickMovementProductId, setQuickMovementProductId] = useState<string | null>(null);

  // Filter products locally
  const filteredProducts = initialProducts.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" || p.categoryId === selectedCategory;

    let matchesStock = true;
    if (stockFilter === "IN_STOCK") matchesStock = p.totalStock > p.lowStockThreshold;
    if (stockFilter === "LOW") matchesStock = p.totalStock > 0 && p.totalStock <= p.lowStockThreshold;
    if (stockFilter === "OUT") matchesStock = p.totalStock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${name}" ?`)) return;
    try {
      await deleteProduct(id);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Produits & Articles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez votre catalogue de portes, quincaillerie, serrures et fournitures.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Catégories</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Produit</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, référence SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Level Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="IN_STOCK">Stock suffisant</option>
            <option value="LOW">Stock faible (alerte)</option>
            <option value="OUT">Rupture de stock</option>
          </select>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center rounded-xl bg-slate-950 border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "table" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Vue Tableau"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "grid" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Vue Grille"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Content View */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center flex flex-col items-center justify-center">
          <Package className="w-10 h-10 text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-white">Aucun produit trouvé</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {searchTerm || selectedCategory !== "ALL" || stockFilter !== "ALL"
              ? "Aucun article ne correspond à vos filtres de recherche."
              : "Commencez par ajouter votre premier produit au catalogue."}
          </p>
          {!searchTerm && selectedCategory === "ALL" && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              Créer un produit
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Article</th>
                  <th className="py-3.5 px-4 font-semibold">SKU / Réf</th>
                  <th className="py-3.5 px-4 font-semibold">Catégorie</th>
                  <th className="py-3.5 px-4 font-semibold">Prix Vente</th>
                  <th className="py-3.5 px-4 font-semibold">Prix Achat</th>
                  <th className="py-3.5 px-4 font-semibold">Stock Total</th>
                  <th className="py-3.5 px-4 font-semibold">Dépôts</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      {/* Product Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-800"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                              {p.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-xs truncate max-w-[200px]">
                              {p.name}
                            </p>
                            {p.description && (
                              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                {p.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4 font-mono text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                          {p.sku}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-300">
                        {p.category?.name || <span className="text-slate-500">-</span>}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 font-semibold text-white">
                        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(p.price)}
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-4 text-slate-400">
                        {p.costPrice > 0
                          ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(p.costPrice)
                          : "-"}
                      </td>

                      {/* Stock badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              p.isOutOfStock
                                ? "bg-rose-500/15 border border-rose-500/30 text-rose-400"
                                : p.isLowStock
                                ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                                : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                            }`}
                          >
                            {p.totalStock} {p.unit}
                          </span>
                          {p.isLowStock && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                      </td>

                      {/* Warehouses breakdown */}
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {p.stocks.length === 0 ? (
                          <span className="text-slate-500">Aucun</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {p.stocks
                              .filter((s: any) => s.quantity > 0)
                              .map((s: any) => (
                                <span
                                  key={s.id}
                                  className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300"
                                >
                                  {s.warehouse?.name}: {s.quantity}
                                </span>
                              ))}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick movement button */}
                          <button
                            onClick={() => setQuickMovementProductId(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition cursor-pointer"
                            title="Entrée / Sortie rapide"
                          >
                            <ArrowDownRight className="w-4 h-4" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition p-4 flex flex-col justify-between shadow-md group"
            >
              <div>
                {/* Image */}
                <div className="w-full h-36 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden mb-3 flex items-center justify-center relative">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600">
                      <Boxes className="w-8 h-8 mb-1" />
                      <span className="text-[10px]">Aucune image</span>
                    </div>
                  )}

                  {/* Stock pill overlay */}
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-md ${
                      p.isOutOfStock
                        ? "bg-rose-500 text-white"
                        : p.isLowStock
                        ? "bg-amber-500 text-slate-950"
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    {p.totalStock} {p.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {p.sku}
                  </span>
                  <span>{p.category?.name || "Général"}</span>
                </div>

                <h3 className="font-semibold text-white text-sm line-clamp-1">{p.name}</h3>
                {p.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Prix unitaire</span>
                  <span className="text-sm font-bold text-white">
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(p.price)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQuickMovementProductId(p.id)}
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
                    title="Mouvement rapide"
                  >
                    <ArrowDownRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
        <ProductModal
          categories={categories}
          suppliers={suppliers}
          warehouses={warehouses}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {editingProduct && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          suppliers={suppliers}
          warehouses={warehouses}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => router.refresh()}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal
          categories={categories}
          onClose={() => setIsCategoryModalOpen(false)}
          onRefresh={() => router.refresh()}
        />
      )}

      {quickMovementProductId && (
        <QuickMovementModal
          defaultProductId={quickMovementProductId}
          onClose={() => setQuickMovementProductId(null)}
        />
      )}
    </div>
  );
}
