import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const profile = await getProfile();

  if (profile?.role === "admin") {
    redirect("/admin");
  } else if (profile?.role === "client") {
    redirect("/dashboard");
  } else {
    redirect("/");
  }
}
