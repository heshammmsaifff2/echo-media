import { requireClient } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireClient();

  return (
    /* pt-28 clears the fixed site navbar. */
    <div className="mx-auto max-w-4xl px-6 pb-16 pt-28 sm:px-10">
      {children}
    </div>
  );
}
