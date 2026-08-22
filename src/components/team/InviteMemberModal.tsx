"use client";

import React, { useState } from "react";
import { X, Loader2, AlertCircle, Mail } from "lucide-react";
import { inviteTeamMember } from "@/actions/team";

interface InviteMemberModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteMemberModal({ onClose, onSuccess }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EMPLOYEE" | "ADMIN">("EMPLOYEE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await inviteTeamMember(email.trim(), role);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi de l'invitation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Inviter un membre</h2>
            <p className="text-xs text-slate-400">
              Envoyez une invitation par email pour rejoindre votre équipe
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
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Adresse email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="collaborateur@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Rôle
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "EMPLOYEE" | "ADMIN")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="EMPLOYEE">Employé</option>
                <option value="ADMIN">Administrateur</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {role === "ADMIN"
                  ? "Peut gérer les produits, mouvements et inviter/retirer des employés."
                  : "Peut consulter et gérer les produits et mouvements de stock."}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{submitting ? "Envoi..." : "Envoyer l'invitation"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
