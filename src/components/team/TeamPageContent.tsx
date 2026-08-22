"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Users,
  Crown,
  ShieldCheck,
  User,
  Mail,
  Trash2,
  Clock,
  X,
} from "lucide-react";
import InviteMemberModal from "./InviteMemberModal";
import { updateMemberRole, removeMember, cancelInvitation } from "@/actions/team";

interface TeamPageContentProps {
  members: any[];
  invitations: any[];
  currentUserId: string;
  currentUserRole: "OWNER" | "ADMIN" | "EMPLOYEE";
}

const roleBadge = {
  OWNER: {
    label: "Propriétaire",
    icon: Crown,
    className: "bg-amber-500/15 border-amber-500/30 text-amber-400",
  },
  ADMIN: {
    label: "Administrateur",
    icon: ShieldCheck,
    className: "bg-indigo-500/15 border-indigo-500/30 text-indigo-400",
  },
  EMPLOYEE: {
    label: "Employé",
    icon: User,
    className: "bg-slate-500/15 border-slate-500/30 text-slate-300",
  },
};

export default function TeamPageContent({
  members,
  invitations,
  currentUserId,
  currentUserRole,
}: TeamPageContentProps) {
  const router = useRouter();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  async function handleRoleChange(userId: string, role: "ADMIN" | "EMPLOYEE") {
    setUpdatingId(userId);
    setError(null);
    try {
      await updateMemberRole(userId, role);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Impossible de modifier le rôle.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemove(userId: string, name: string) {
    if (!confirm(`Voulez-vous vraiment retirer "${name}" de l'équipe ?`)) return;
    setUpdatingId(userId);
    setError(null);
    try {
      await removeMember(userId);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Impossible de retirer ce membre.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleCancelInvitation(id: string, email: string) {
    if (!confirm(`Annuler l'invitation envoyée à "${email}" ?`)) return;
    setUpdatingId(id);
    setError(null);
    try {
      await cancelInvitation(id);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Impossible d'annuler l'invitation.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Équipe</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez les membres de votre organisation et leurs invitations.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Inviter un membre</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Members */}
      <div>
        <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          <Users className="w-3.5 h-3.5" />
          Membres ({members.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const badge = roleBadge[member.role as keyof typeof roleBadge] || roleBadge.EMPLOYEE;
            const BadgeIcon = badge.icon;
            const isSelf = member.id === currentUserId;
            const isOwner = member.role === "OWNER";
            const canChangeRole = currentUserRole === "OWNER" && !isSelf && !isOwner;
            const canDelete =
              canManage &&
              !isSelf &&
              !isOwner &&
              !(currentUserRole === "ADMIN" && member.role === "ADMIN");

            return (
              <div
                key={member.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition p-4 shadow-md"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">
                      {member.name || "Utilisateur"}
                      {isSelf && <span className="text-slate-500 font-normal"> (vous)</span>}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.className}`}
                >
                  <BadgeIcon className="w-3.5 h-3.5" />
                  <span>{badge.label}</span>
                </span>

                {(canChangeRole || canDelete) && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    {canChangeRole && (
                      <select
                        value={member.role}
                        disabled={updatingId === member.id}
                        onChange={(e) =>
                          handleRoleChange(member.id, e.target.value as "ADMIN" | "EMPLOYEE")
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="EMPLOYEE">Employé</option>
                        <option value="ADMIN">Administrateur</option>
                      </select>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleRemove(member.id, member.name || member.email)}
                        disabled={updatingId === member.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-50"
                        title="Retirer de l'équipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div>
          <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5" />
            Invitations en attente ({invitations.length})
          </h2>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
            {invitations.map((invitation) => {
              const badge = roleBadge[invitation.role as keyof typeof roleBadge] || roleBadge.EMPLOYEE;
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={invitation.id}
                  className="p-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{invitation.email}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Invité par {invitation.invitedByName || "un administrateur"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.className}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>

                    {canManage && (
                      <button
                        onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                        disabled={updatingId === invitation.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-50"
                        title="Annuler l'invitation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isInviteOpen && (
        <InviteMemberModal
          onClose={() => setIsInviteOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
