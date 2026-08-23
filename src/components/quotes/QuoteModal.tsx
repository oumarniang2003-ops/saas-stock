"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { createQuote, updateQuote, QuoteItemInput } from "@/actions/quotes";

interface QuoteModalProps {
  quote?: any;
  products: any[];
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemRow extends QuoteItemInput {
  key: string;
}

let rowKeyCounter = 0;
function newRowKey() {
  rowKeyCounter += 1;
  return `row-${rowKeyCounter}`;
}

function emptyRow(): ItemRow {
  return {
    key: newRowKey(),
    productId: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
  };
}

export default function QuoteModal({ quote, products, onClose, onSuccess }: QuoteModalProps) {
  const isEditing = Boolean(quote);

  const [clientName, setClientName] = useState(quote?.clientName || "");
  const [clientPhone, setClientPhone] = useState(quote?.clientPhone || "");
  const [clientEmail, setClientEmail] = useState(quote?.clientEmail || "");
  const [clientAddress, setClientAddress] = useState(quote?.clientAddress || "");
  const [validUntil, setValidUntil] = useState(
    quote?.validUntil ? new Date(quote.validUntil).toISOString().slice(0, 10) : ""
  );
  const [notes, setNotes] = useState(quote?.notes || "");

  const [items, setItems] = useState<ItemRow[]>(
    quote?.items?.length
      ? quote.items.map((item: any) => ({
          key: newRowKey(),
          productId: item.productId || "",
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      : [emptyRow()]
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);

  function addRow() {
    setItems((prev) => [...prev, emptyRow()]);
  }

  function removeRow(key: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  function updateRow(key: string, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function handleProductSelect(key: string, productId: string) {
    if (!productId) {
      updateRow(key, { productId: "" });
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    updateRow(key, {
      productId,
      description: product.name,
      unitPrice: product.price,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!clientName.trim()) {
      setError("Le nom du client est obligatoire.");
      return;
    }

    const validItems = items.filter((i) => i.description.trim());
    if (validItems.length === 0) {
      setError("Ajoutez au moins un article avec une description.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || undefined,
        clientEmail: clientEmail.trim() || undefined,
        clientAddress: clientAddress.trim() || undefined,
        notes: notes.trim() || undefined,
        validUntil: validUntil || undefined,
        items: validItems.map((i) => ({
          productId: i.productId || null,
          description: i.description.trim(),
          quantity: Number(i.quantity) || 1,
          unitPrice: Number(i.unitPrice) || 0,
        })),
      };

      if (isEditing) {
        await updateQuote(quote.id, payload);
      } else {
        await createQuote(payload);
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              {isEditing ? "Modifier le Devis" : "Nouveau Devis"}
            </h2>
            <p className="text-xs text-slate-400">
              {isEditing ? quote.number : "Un numéro sera généré automatiquement"}
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Client Info */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Informations client
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nom du client <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Entreprise Dupont SARL"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: +221 77 123 45 67"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="client@entreprise.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Date de validité
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    placeholder="Adresse du client"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Articles du devis
                </h3>
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une ligne</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {items.map((item) => {
                  const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                  return (
                    <div
                      key={item.key}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={item.productId || ""}
                          onChange={(e) => handleProductSelect(item.key, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="">Article libre (hors catalogue)</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          placeholder="Description de l'article"
                          value={item.description}
                          onChange={(e) => updateRow(item.key, { description: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Quantité</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateRow(item.key, { quantity: Number(e.target.value) || 1 })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">
                            Prix unitaire
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateRow(item.key, { unitPrice: Number(e.target.value) || 0 })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Total</label>
                          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-white text-xs font-semibold">
                            {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "XOF",
                            }).format(lineTotal)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeRow(item.key)}
                          disabled={items.length === 1}
                          className="self-end p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end mt-3 pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400 mr-3">Total général</span>
                <span className="text-base font-bold text-white">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(total)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Notes</label>
              <textarea
                rows={3}
                placeholder="Conditions, délais, remarques..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Error */}
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
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{submitting ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer le devis"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
