"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Trash2, Check, Dot } from "lucide-react";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export function MessagesList({ initial }: { initial: ContactMessage[] }) {
  const { isAr } = useI18n();
  const t = (en: string, ar: string) => (isAr ? ar : en);
  const [items, setItems] = useState(initial);

  const fmt = (d: string) =>
    new Date(d).toLocaleString(isAr ? "ar-EG" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const toggleRead = async (m: ContactMessage) => {
    const next = !m.is_read;
    setItems((xs) => xs.map((x) => (x.id === m.id ? { ...x, is_read: next } : x)));
    const supabase = createClient();
    await supabase.from("contact_submissions").update({ is_read: next }).eq("id", m.id);
  };

  const remove = async (id: string) => {
    if (!confirm(t("Delete this message?", "حذف هذه الرسالة؟"))) return;
    setItems((xs) => xs.filter((x) => x.id !== id));
    const supabase = createClient();
    await supabase.from("contact_submissions").delete().eq("id", id);
  };

  const unread = items.filter((m) => !m.is_read).length;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold">{t("Messages", "الرسائل")}</h1>
        {unread > 0 && (
          <Badge className="bg-[hsl(var(--echo-accent))]/15 text-[hsl(var(--echo-accent))] border-transparent">
            {unread} {t("new", "جديدة")}
          </Badge>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("No messages yet.", "لا توجد رسائل بعد.")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((m) => (
            <Card key={m.id} className={m.is_read ? "opacity-80" : ""}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!m.is_read && <Dot className="text-[hsl(var(--echo-accent))]" size={26} />}
                      <p className="font-semibold">{m.name}</p>
                      <span className="text-xs text-muted-foreground">· {fmt(m.created_at)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground" dir="ltr">
                        <Mail size={14} /> {m.email}
                      </a>
                      {m.phone && (
                        <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1.5 hover:text-foreground" dir="ltr">
                          <Phone size={14} /> {m.phone}
                        </a>
                      )}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRead(m)}
                      title={m.is_read ? t("Mark unread", "تعليم كغير مقروءة") : t("Mark read", "تعليم كمقروءة")}
                      className="cursor-pointer"
                    >
                      <Check size={16} className={m.is_read ? "text-green-500" : "text-muted-foreground"} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(m.id)}
                      className="text-destructive cursor-pointer"
                      title={t("Delete", "حذف")}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
