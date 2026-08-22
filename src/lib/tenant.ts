import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export interface TenantContext {
  userId: string;
  clerkId: string;
  email: string;
  name: string;
  role: "OWNER" | "ADMIN" | "EMPLOYEE";
  organizationId: string;
  organizationName: string;
}

/**
 * Ensures the user is authenticated with Clerk and exists in our database with an associated organization.
 * If the user is logging in for the first time, this function automatically creates:
 * 1. Their Organization
 * 2. A default Warehouse ("Entrepôt Principal")
 * 3. Initial default categories for doors & hardware
 * 4. The User with OWNER role
 */
export async function requireTenant(): Promise<TenantContext> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const clerkUser = await currentUser();
  const primaryEmail =
    clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    "user@example.com";

  const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || clerkUser?.username || "Administrateur";

  // Check if user already exists in database
  let dbUser = await prisma.user.findUnique({
    where: { clerkId },
    include: { organization: true },
  });

  if (!dbUser) {
    // Check for a pending invitation for this email — if found, join that organization
    // instead of creating a brand new one.
    const invitation = await prisma.invitation.findFirst({
      where: {
        email: primaryEmail,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });

    if (invitation) {
      const joined = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            clerkId,
            email: primaryEmail,
            name: fullName,
            role: invitation.role,
            organizationId: invitation.organizationId,
          },
          include: { organization: true },
        });

        await tx.invitation.update({
          where: { id: invitation.id },
          data: { status: "ACCEPTED" },
        });

        return user;
      });

      dbUser = joined;

      return {
        userId: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        name: dbUser.name || fullName,
        role: dbUser.role,
        organizationId: dbUser.organizationId,
        organizationName: dbUser.organization.name,
      };
    }

    // Check if an organization with similar email exists or create a new organization
    const orgName = clerkUser?.firstName
      ? `Stock & Quincaillerie ${clerkUser.firstName}`
      : "Mon Entreprise";

    const baseSlug = (clerkUser?.firstName || "entreprise")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

    // Create organization, default warehouse, starter categories and the owner user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug: uniqueSlug,
        },
      });

      // Default warehouse
      await tx.warehouse.create({
        data: {
          name: "Entrepôt Principal",
          location: "Bâtiment A - Zone Principale",
          isDefault: true,
          organizationId: org.id,
        },
      });

      // Starter categories for stock (portes, quincaillerie, outillage...)
      await tx.category.createMany({
        data: [
          { name: "Portes & Huisseries", description: "Portes blindées, intérieures, coupe-feu", organizationId: org.id },
          { name: "Quincaillerie & Serrures", description: "Poignées, serrures, verrous, paumelles", organizationId: org.id },
          { name: "Accessoires & Visserie", description: "Vis, chevilles, joints, équerres", organizationId: org.id },
          { name: "Outillage & Équipements", description: "Outils de pose, consommables", organizationId: org.id },
        ],
      });

      // Owner User
      const user = await tx.user.create({
        data: {
          clerkId,
          email: primaryEmail,
          name: fullName,
          role: "OWNER",
          organizationId: org.id,
        },
        include: { organization: true },
      });

      return user;
    });

    dbUser = result;
  }

  return {
    userId: dbUser.id,
    clerkId: dbUser.clerkId,
    email: dbUser.email,
    name: dbUser.name || fullName,
    role: dbUser.role,
    organizationId: dbUser.organizationId,
    organizationName: dbUser.organization.name,
  };
}
