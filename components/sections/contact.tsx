"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { contactPage } from "@/lib/brand";
import { FadeIn } from "@/components/motion";
import { Loader2, Check } from "lucide-react";

export function ContactContent() {
  const { pick, isAr } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setState("sending");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("contact_submissions").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        message: form.message.trim(),
      });
      if (error) throw error;
      setState("done");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setState("error");
    }
  };

  const inputBase =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-[hsl(var(--echo-accent))]";

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-background grain">
      {/* Accent bloom — colour only, no image. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute end-0 top-0 h-[440px] w-[720px] max-w-[100vw] -translate-y-1/4 translate-x-1/4 rounded-full bg-[hsl(var(--echo-accent))] opacity-[0.12] blur-[150px]"
      />

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-center px-6 pt-32 pb-20 sm:px-10">
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-6 flex items-center gap-5">
              <span className="eyebrow whitespace-nowrap">{pick(contactPage.eyebrow)}</span>
              <span className="h-px w-16 bg-border" />
            </div>
            <h1 className="display-lg text-bright">{pick(contactPage.heading)}</h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">{pick(contactPage.body)}</p>
          </div>

          <FadeIn>
            {state === "done" ? (
              <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-8">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--echo-accent))] text-[hsl(var(--echo-base))]">
                  <Check size={22} />
                </span>
                <p className="text-lg text-bright">{pick(contactPage.success)}</p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="grid gap-4 rounded-2xl border border-border bg-surface/50 p-6 sm:p-8"
              >
                <input
                  className={inputBase}
                  placeholder={pick(contactPage.fields.name)}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  dir={isAr ? "rtl" : "ltr"}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="email"
                    className={inputBase}
                    placeholder={pick(contactPage.fields.email)}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    dir="ltr"
                  />
                  <input
                    className={inputBase}
                    placeholder={pick(contactPage.fields.phone)}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <textarea
                  className={`${inputBase} min-h-32 resize-y`}
                  placeholder={pick(contactPage.fields.message)}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={5}
                  dir={isAr ? "rtl" : "ltr"}
                />

                {state === "error" && (
                  <p className="text-sm text-red-400">{pick(contactPage.error)}</p>
                )}

                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--echo-accent))] px-8 py-3.5 text-sm font-semibold text-[hsl(var(--echo-base))] transition-transform duration-300 hover:scale-[1.02] disabled:opacity-70 cursor-pointer"
                >
                  {state === "sending" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> {pick(contactPage.sending)}
                    </>
                  ) : (
                    pick(contactPage.submit)
                  )}
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
