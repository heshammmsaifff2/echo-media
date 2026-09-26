import {
  LayoutDashboard,
  Image,
  ShoppingCart,
  Users,
  LayoutTemplate,
  Mail,
  Contact,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { href: string; icon: LucideIcon; labelEn: string; labelAr: string };

/** Shared admin navigation — used by both the sidebar and the mobile top bar. */
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", icon: LayoutDashboard, labelEn: "Dashboard", labelAr: "الرئيسية" },
  { href: "/admin/content", icon: LayoutTemplate, labelEn: "Content", labelAr: "المحتوى" },
  { href: "/admin/contact", icon: Contact, labelEn: "Contact", labelAr: "بيانات التواصل" },
  { href: "/admin/portfolio", icon: Image, labelEn: "Portfolio", labelAr: "الأعمال" },
  { href: "/admin/messages", icon: Mail, labelEn: "Messages", labelAr: "الرسائل" },
  { href: "/admin/orders", icon: ShoppingCart, labelEn: "Orders", labelAr: "الطلبات" },
  { href: "/admin/finance", icon: Wallet, labelEn: "Finance", labelAr: "المالية" },
  { href: "/admin/clients", icon: Users, labelEn: "Clients", labelAr: "العملاء" },
];
