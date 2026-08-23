"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, FileText, Download, Edit2, Trash2 } from "lucide-react";
import QuoteModal from "./QuoteModal";
import { updateQuoteStatus, deleteQuote } from "@/actions/quotes";
import { downloadQuotePdf } from "@/lib/quotePdf";

interface QuoteListProps {
  quotes: any[];
  products: any[];
  organizationName: string;
}

const statusConfig = {
  DRAFT: { label: "Brouillon", className: "bg-slate-500/15 border-slate-500/30 text-slate-300" },
  SENT: { label: "Envoyé", className: "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" },
  ACCEPTED: { label: "Accepté", className: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" },
  REJECTED: { label: "Refusé", className: "bg-rose-500/15 border-rose-500/30 text-rose-400" },
  EXPIRED: { label: "Expiré", className: "bg-amber-500/15 border-amber-500/30 text-amber-400" },
};

export default function QuoteList({ quotes, products, organizationName }: QuoteListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredQuotes = quotes.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      q.number.toLowerCase().includes(term) ||
      q.clientName.toLowerCase().includes(term)
    );
  });

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    try {
      await updateQuoteStatus(id, status as any);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la mise à jour du statut.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string, number: string) {
    if (!confirm(`Voulez-vous vraiment supprimer le devis "${number}" ?`)) return;
    try {
      await deleteQuote(id);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Devis</h1>
          <p className="text-xs text-slate-400 mt-1">
            Créez et suivez vos devis clients.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Devis</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par numéro ou nom de client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Quotes Grid */}
      {filteredQuotes.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center flex flex-col items-center justify-center">
          <FileText className="w-10 h-10 text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-white">Aucun devis trouvé</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {searchTerm
              ? "Aucun devis ne correspond à votre recherche."
              : "Commencez par créer votre premier devis."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              Créer un devis
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuotes.map((quote) => {
            const status = statusConfig[quote.status as keyof typeof statusConfig] || statusConfig.DRAFT;
            const dateStr = new Date(quote.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            return (
              <div
                key={quote.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition p-4 flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-indigo-400 font-semibold">{quote.number}</p>
                      <h3 className="font-semibold text-white text-sm truncate mt-0.5">
                        {quote.clientName}
                      </h3>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold border ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1">{dateStr}</p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Montant total</span>
                      <span className="text-sm font-bold text-white">
                        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(
                          quote.total
                        )}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Articles</span>
                      <span className="text-sm font-semibold text-slate-200">
                        {quote.items.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <select
                    value={quote.status}
                    disabled={updatingId === quote.id}
                    onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="DRAFT">Brouillon</option>
                    <option value="SENT">Envoyé</option>
                    <option value="ACCEPTED">Accepté</option>
                    <option value="REJECTED">Refusé</option>
                    <option value="EXPIRED">Expiré</option>
                  </select>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => downloadQuotePdf(quote, organizationName)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                      title="Télécharger le PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingQuote(quote)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-indigo-400 hover:bg-indigo-500/10 transition cursor-pointer"
                      title="Modifier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(quote.id, quote.number)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
        <QuoteModal
          products={products}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {editingQuote && (
        <QuoteModal
          quote={editingQuote}
          products={products}
          onClose={() => setEditingQuote(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
