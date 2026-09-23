import "server-only";
import { createClient } from "@/lib/supabase/server";
import { contact as defaultContact, type Contact } from "@/lib/brand";

/**
 * The site's contact details, editable from the admin panel (site_settings).
 * Falls back to the code default in content/contact.json when nothing is stored
 * or the request fails, so the footer always renders.
 */
export async function getSiteContact(): Promise<Contact> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "contact")
      .maybeSingle();
    if (data?.value) return { ...defaultContact, ...(data.value as Contact) };
  } catch {
    /* fall through to default */
  }
  return defaultContact;
}
