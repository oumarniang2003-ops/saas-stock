"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowDownRight, ArrowUpRight, Sliders, ArrowLeftRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { recordStockMovement } from "@/actions/movements";
import { getProducts } from "@/actions/products";
import { getWarehouses } from "@/actions/warehouses";

interface QuickMovementModalProps {
  onClose: () => void;
  defaultProductId?: string;
  defaultType?: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER";
}

export default function QuickMovementModal({
  onClose,
  defaultProductId,
  defaultType = "IN",
}: QuickMovementModalProps) {
  const [type, setType] = useState<"IN" | "OUT" | "ADJUSTMENT" | "TRANSFER">(defaultType);
  const [productId, setProductId] = useState(defaultProductId || "");
  const [quantity, setQuantity] = useState<number | "">("");
  const [warehouseId, setWarehouseId] = useState("");
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");

  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [prods, whs] = await Promise.all([getProducts(), getWarehouses()]);
        setProducts(prods);
        setWarehouses(whs);

        if (!productId && prods.length > 0) {
          setProductId(prods[0].id);
        }

        const defaultWh = whs.find((w) => w.isDefault) || whs[0];
        if (defaultWh) {
          setWarehouseId(defaultWh.id);
          setFromWarehouseId(defaultWh.id);
          const secondWh = whs.find((w) => w.id !== defaultWh.id) || whs[0];
          if (secondWh) setToWarehouseId(secondWh.id);
        }
      } catch (err) {
        console.error("Failed to load options", err);
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, []);

  const selectedProduct = products.find((p) => p.id === productId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) {
      setError("Veuillez sélectionner un produit.");
      return;
    }
    const numQty = Number(quantity);
    if (!numQty || numQty <= 0) {
      setError("Veuillez saisir une quantité valide supérieure à 0.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await recordStockMovement({
        type,
        productId,
        quantity: numQty,
        reason: reason || undefined,
        reference: reference || undefined,
        warehouseId: type !== "TRANSFER" ? warehouseId : undefined,
        fromWarehouseId: type === "TRANSFER" ? fromWarehouseId : undefined,
        toWarehouseId: type === "TRANSFER" ? toWarehouseId : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Nouveau Mouvement de Stock</h2>
              <p className="text-xs text-slate-400">Enregistrement atomique & mise à jour du stock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
              <p className="text-xs text-slate-400">Chargement des données...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setType("IN")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    type === "IN"
                      ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50"
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 mb-1" />
                  <span>Entrée (IN)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("OUT")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    type === "OUT"
                      ? "bg-rose-500/15 border-rose-500/50 text-rose-400 shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 mb-1" />
                  <span>Sortie (OUT)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("ADJUSTMENT")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    type === "ADJUSTMENT"
                      ? "bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50"
                  }`}
                >
                  <Sliders className="w-4 h-4 mb-1" />
                  <span>Ajustement</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("TRANSFER")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    type === "TRANSFER"
                      ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-400 shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50"
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4 mb-1" />
                  <span>Transfert</span>
                </button>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Produit <span className="text-rose-400">*</span>
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Stock: {p.totalStock} {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warehouses Selection */}
              {type !== "TRANSFER" ? (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Entrepôt concerné <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                    required
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} {w.isDefault ? "(Principal)" : ""} {w.location ? `— ${w.location}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Entrepôt Source (Départ) <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={fromWarehouseId}
                      onChange={(e) => setFromWarehouseId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                      required
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Entrepôt Cible (Arrivée) <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={toWarehouseId}
                      onChange={(e) => setToWarehouseId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                      required
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {type === "ADJUSTMENT"
                    ? `Nouvelle quantité totale (${selectedProduct?.unit || "unités"})`
                    : `Quantité à ${type === "IN" ? "ajouter" : type === "OUT" ? "déduire" : "transférer"} (${selectedProduct?.unit || "unités"})`}{" "}
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ex: 25"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Reason & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Motif / Justification
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Réception BL-4089, Vente #102..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    N° Référence / Facture
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: FAC-2026-001"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Feedback Alert */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Mouvement de stock enregistré avec succès !</span>
                </div>
              )}

              {/* Action Buttons */}
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
                  disabled={submitting || success}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? "Validation..." : "Valider le Mouvement"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
