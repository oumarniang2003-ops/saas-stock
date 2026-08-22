import { requireTenant } from "@/lib/tenant";
import { getTeamMembers, getPendingInvitations } from "@/actions/team";
import AppShell from "@/components/layout/AppShell";
import TeamPageContent from "@/components/team/TeamPageContent";

export const revalidate = 0;

export default async function TeamPage() {
  const tenant = await requireTenant();
  const [members, invitations] = await Promise.all([
    getTeamMembers(),
    getPendingInvitations(),
  ]);

  return (
    <AppShell organizationName={tenant.organizationName} userRole={tenant.role}>
      <TeamPageContent
        members={members}
        invitations={invitations}
        currentUserId={tenant.userId}
        currentUserRole={tenant.role}
      />
    </AppShell>
  );
}
