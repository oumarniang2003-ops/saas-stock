"use server";

import { requireTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTeamMembers() {
  const { organizationId } = await requireTenant();

  return await prisma.user.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPendingInvitations() {
  const { organizationId } = await requireTenant();

  return await prisma.invitation.findMany({
    where: { organizationId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}

export async function inviteTeamMember(email: string, role: "ADMIN" | "EMPLOYEE") {
  const { organizationId, role: requesterRole, name } = await requireTenant();

  if (requesterRole !== "OWNER" && requesterRole !== "ADMIN") {
    throw new Error("Vous n'avez pas les droits pour inviter un membre.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findFirst({
    where: { organizationId, email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("Cette personne fait déjà partie de votre équipe.");
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.invitation.upsert({
    where: {
      organizationId_email: {
        organizationId,
        email: normalizedEmail,
      },
    },
    create: {
      email: normalizedEmail,
      role,
      organizationId,
      invitedByName: name,
      expiresAt,
    },
    update: {
      role,
      status: "PENDING",
      invitedByName: name,
      expiresAt,
    },
  });

  revalidatePath("/team");
}

export async function cancelInvitation(id: string) {
  const { organizationId, role: requesterRole } = await requireTenant();

  if (requesterRole !== "OWNER" && requesterRole !== "ADMIN") {
    throw new Error("Vous n'avez pas les droits pour annuler cette invitation.");
  }

  await prisma.invitation.deleteMany({
    where: { id, organizationId },
  });

  revalidatePath("/team");
}

export async function updateMemberRole(userId: string, role: "ADMIN" | "EMPLOYEE") {
  const { organizationId, role: requesterRole, userId: requesterId } = await requireTenant();

  if (requesterRole !== "OWNER") {
    throw new Error("Seul le propriétaire peut modifier les rôles.");
  }

  if (userId === requesterId) {
    throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  }

  await prisma.user.updateMany({
    where: { id: userId, organizationId },
    data: { role },
  });

  revalidatePath("/team");
}

export async function removeMember(userId: string) {
  const { organizationId, role: requesterRole, userId: requesterId } = await requireTenant();

  if (requesterRole !== "OWNER" && requesterRole !== "ADMIN") {
    throw new Error("Vous n'avez pas les droits pour retirer ce membre.");
  }

  if (userId === requesterId) {
    throw new Error("Vous ne pouvez pas vous retirer vous-même.");
  }

  const target = await prisma.user.findFirst({
    where: { id: userId, organizationId },
  });

  if (!target) {
    throw new Error("Membre introuvable.");
  }

  if (target.role === "OWNER") {
    throw new Error("Le propriétaire ne peut pas être retiré.");
  }

  if (requesterRole === "ADMIN" && target.role === "ADMIN") {
    throw new Error("Un administrateur ne peut pas retirer un autre administrateur.");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/team");
}
