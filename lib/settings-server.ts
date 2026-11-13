import "server-only";
import { createClient } from "@/lib/supabase/server";
import { contact as defaultContact, type Contact } from "@/lib/brand";

export const defaultStudioContact: Contact = {
  ...defaultContact,
  email: "studio@echomedia.production",
  phones: [
    {
      number: "+20 123 456 7891",
      label: { en: "Studio Bookings", ar: "حجوزات الاستوديو" },
      whatsapp: true,
    },
  ],
  social: [
    { name: "Instagram", url: "https://instagram.com/arthouse.studio" },
    { name: "Facebook", url: "https://facebook.com/arthouse.studio" },
    { name: "TikTok", url: "https://tiktok.com/@arthouse.studio" },
  ],
};

/**
 * The site's global contact details, editable from the admin panel (site_settings: contact).
 * Falls back to the code default in content/contact.json when nothing is stored.
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

/**
 * Art House Studio dedicated contact details (site_settings: contact_studio).
 * Gives dedicated control over studio contact/social links so studio pages
 * do not inherit global Echo handles.
 */
export async function getStudioContact(): Promise<Contact> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "contact_studio")
      .maybeSingle();
    if (data?.value) return { ...defaultStudioContact, ...(data.value as Contact) };
  } catch {
    /* fall through to default */
  }
  return defaultStudioContact;
}
