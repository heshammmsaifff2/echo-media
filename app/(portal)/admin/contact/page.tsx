import { requireAdmin } from "@/lib/auth";
import { getSiteContact } from "@/lib/settings-server";
import { ContactEditor } from "@/components/admin/contact-editor";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  await requireAdmin();
  const contact = await getSiteContact();
  return <ContactEditor initial={contact} />;
}
