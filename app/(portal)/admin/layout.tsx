import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();

  return (
    /* pt-20 clears the fixed site navbar. */
    <div className="flex min-h-[calc(100vh-5rem)] pt-20">
      <AdminSidebar profile={profile} />
      <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}
