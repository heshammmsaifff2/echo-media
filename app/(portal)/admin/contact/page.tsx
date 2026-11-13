import { requireAdmin } from "@/lib/auth";
import { getSiteContact, getStudioContact } from "@/lib/settings-server";
import { ContactEditor } from "@/components/admin/contact-editor";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  await requireAdmin();
  const [contact, studioContact] = await Promise.all([
    getSiteContact(),
    getStudioContact(),
  ]);
  return <ContactEditor initial={contact} initialStudio={studioContact} />;
}
