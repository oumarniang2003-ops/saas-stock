"use client";

import React, { useState } from "react";
import { X, Upload, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { createProduct, updateProduct } from "@/actions/products";

interface ProductModalProps {
  product?: any;
  categories: any[];
  suppliers: any[];
  warehouses: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductModal({
  product,
  categories,
  suppliers,
  warehouses,
  onClose,
  onSuccess,
}: ProductModalProps) {
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name || "");
  const [sku, setSku] = useState(product?.sku || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState<number | "">(product?.price ?? "");
  const [costPrice, setCostPrice] = useState<number | "">(product?.costPrice ?? "");
  const [lowStockThreshold, setLowStockThreshold] = useState<number | "">(product?.lowStockThreshold ?? 5);
  const [unit, setUnit] = useState(product?.unit || "pièce");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [supplierId, setSupplierId] = useState(product?.supplierId || "");

  // Initial stock for creation
  const [initialWarehouseId, setInitialWarehouseId] = useState(
    warehouses.find((w) => w.isDefault)?.id || warehouses[0]?.id || ""
  );
  const [initialQuantity, setInitialQuantity] = useState<number | "">("");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'upload de l'image");
      }

      const data = await res.json();
      setImageUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Impossible d'uploader le fichier");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      setError("Le nom et la référence SKU sont obligatoires.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditing) {
        await updateProduct(product.id, {
          name: name.trim(),
          sku: sku.trim(),
          description: description.trim() || undefined,
          price: Number(price) || 0,
          costPrice: Number(costPrice) || 0,
          lowStockThreshold: Number(lowStockThreshold) || 5,
          unit,
          imageUrl: imageUrl.trim() || undefined,
          categoryId: categoryId || null,
          supplierId: supplierId || null,
        });
      } else {
        await createProduct({
          name: name.trim(),
          sku: sku.trim(),
          description: description.trim() || undefined,
          price: Number(price) || 0,
          costPrice: Number(costPrice) || 0,
          lowStockThreshold: Number(lowStockThreshold) || 5,
          unit,
          imageUrl: imageUrl.trim() || undefined,
          categoryId: categoryId || undefined,
          supplierId: supplierId || undefined,
          initialStock:
            initialQuantity && Number(initialQuantity) > 0
              ? {
                  warehouseId: initialWarehouseId,
                  quantity: Number(initialQuantity),
                }
              : undefined,
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              {isEditing ? "Modifier le Produit" : "Ajouter un Nouveau Produit"}
            </h2>
            <p className="text-xs text-slate-400">
              Quincaillerie, portes, serrures, outillage et consommables
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Name & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nom du produit <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Porte Blindée SecurMax 204x83"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Référence / SKU <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: POR-SEC-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Description / Spécifications techniques
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Épaisseur 65mm, serrure 5 points A2P*, finition chêne doré..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Row 2: Category, Supplier & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Aucune catégorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Fournisseur
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Aucun fournisseur</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Unité de mesure
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="pièce">Pièce (u)</option>
                  <option value="lot">Lot / Paquet</option>
                  <option value="m²">Mètre carré (m²)</option>
                  <option value="m">Mètre linéaire (m)</option>
                  <option value="kg">Kilogramme (kg)</option>
                  <option value="boîte">Boîte</option>
                </select>
              </div>
            </div>

            {/* Row 3: Prices & Low Stock Threshold */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prix de Vente (FCFA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prix d'Achat (FCFA HT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Seuil d'Alerte Stock Min
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="5"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Image Upload & URL */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-medium text-slate-300">
                Photo du produit
              </label>
              <div className="flex items-center gap-4">
                {imageUrl ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 text-rose-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition">
                      {uploadingImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{uploadingImage ? "Téléversement..." : "Uploader une image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="Ou collez une URL d'image directe (ex: https://...)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Initial Stock (Only for Creation) */}
            {!isEditing && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-indigo-400">
                  Stock initial à l'enregistrement (optionnel)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Entrepôt de dépôt
                    </label>
                    <select
                      value={initialWarehouseId}
                      onChange={(e) => setInitialWarehouseId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} {w.isDefault ? "(Principal)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Quantité initiale reçue
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ex: 50"
                      value={initialQuantity}
                      onChange={(e) =>
                        setInitialQuantity(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
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
                disabled={submitting || uploadingImage}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{submitting ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer le produit"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
