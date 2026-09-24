"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, KeyRound, User, Check, Copy } from "lucide-react";

type Client = {
  id: string;
  full_name: string;
  email: string;
  username: string | null;
  role: string;
  created_at: string;
};

export function ClientsList({ clients }: { clients: Client[] }) {
  const { isAr } = useI18n();
  const t = (en: string, ar: string) => (isAr ? ar : en);
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ username: string; password: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [resetFor, setResetFor] = useState<Client | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState<{ username: string; password: string } | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resetCopied, setResetCopied] = useState(false);

  const genPassword = () =>
    Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);

  const handleCreate = async () => {
    setError(null);
    if (form.username.trim().length < 3 || form.password.length < 6) {
      setError(t("Username ≥ 3 chars and password ≥ 6 chars.", "اسم المستخدم ٣ أحرف على الأقل وكلمة المرور ٦."));
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("admin_create_client", {
        p_username: form.username.trim(),
        p_password: form.password,
        p_full_name: form.full_name.trim(),
      });
      if (rpcError) throw rpcError;
      setCreated({ username: form.username.trim().toLowerCase(), password: form.password });
      setForm({ full_name: "", username: "", password: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to create account", "فشل إنشاء الحساب"));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetFor) return;
    setResetError(null);
    if (newPassword.length < 6) {
      setResetError(t("Password must be at least 6 characters.", "كلمة المرور ٦ أحرف على الأقل."));
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("admin_set_client_password", {
        p_client_id: resetFor.id,
        p_password: newPassword,
      });
      if (rpcError) throw rpcError;

      const clientUsername =
        resetFor.username ||
        resetFor.email?.replace(/@clients\.echo\.local$/, "") ||
        resetFor.email;

      setResetSuccess({
        username: clientUsername,
        password: newPassword,
      });
      setNewPassword("");
      router.refresh();
    } catch (err) {
      setResetError(err instanceof Error ? err.message : t("Failed to update password", "فشل تحديث كلمة المرور"));
    } finally {
      setLoading(false);
    }
  };

  const copyCreds = () => {
    if (!created) return;
    navigator.clipboard
      ?.writeText(`${t("Username", "اسم المستخدم")}: ${created.username}\n${t("Password", "كلمة المرور")}: ${created.password}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  const copyResetCreds = () => {
    if (!resetSuccess) return;
    navigator.clipboard
      ?.writeText(`${t("Username", "اسم المستخدم")}: ${resetSuccess.username}\n${t("Password", "كلمة المرور")}: ${resetSuccess.password}`)
      .then(() => {
        setResetCopied(true);
        setTimeout(() => setResetCopied(false), 1500);
      })
      .catch(() => {});
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setCreated(null);
    setError(null);
    setForm({ full_name: "", username: "", password: "" });
  };

  const closeReset = () => {
    setResetFor(null);
    setResetSuccess(null);
    setResetError(null);
    setNewPassword("");
    setResetCopied(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("Clients", "العملاء")}</h1>
        <Dialog open={createOpen} onOpenChange={(o) => (o ? setCreateOpen(true) : closeCreate())}>
          <DialogTrigger asChild>
            <Button className="gap-2 cursor-pointer"><Plus size={16} /> {t("New account", "حساب جديد")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Create client account", "إنشاء حساب عميل")}</DialogTitle>
            </DialogHeader>

            {created ? (
              <div className="grid gap-4 py-2">
                <div className="flex items-center gap-2 text-green-500">
                  <Check size={18} /> <span className="font-medium">{t("Account created", "تم إنشاء الحساب")}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("Share these credentials with the client. Keep the password safe — it isn't stored in readable form.",
                     "شارك هذه البيانات مع العميل. احتفظ بكلمة المرور — لا تُخزَّن بشكل يمكن قراءته لاحقاً.")}
                </p>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm font-mono">
                  <div>{t("Username", "اسم المستخدم")}: <span className="font-semibold">{created.username}</span></div>
                  <div>{t("Password", "كلمة المرور")}: <span className="font-semibold">{created.password}</span></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyCreds} className="gap-2 cursor-pointer">
                    {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? t("Copied", "تم النسخ") : t("Copy", "نسخ")}
                  </Button>
                  <Button onClick={closeCreate} className="cursor-pointer">{t("Done", "تم")}</Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>{t("Full name", "الاسم الكامل")}</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>{t("Username", "اسم المستخدم")}</Label>
                  <Input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.replace(/[^a-zA-Z0-9._-]/g, "") })}
                    dir="ltr"
                    autoCapitalize="none"
                    placeholder="client_name"
                  />
                  <p className="text-xs text-muted-foreground">{t("Letters, numbers, . _ - only.", "حروف وأرقام و . _ - فقط.")}</p>
                </div>
                <div className="grid gap-2">
                  <Label>{t("Password", "كلمة المرور")}</Label>
                  <div className="flex gap-2">
                    <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} dir="ltr" />
                    <Button type="button" variant="outline" onClick={() => setForm({ ...form, password: genPassword() })} className="cursor-pointer whitespace-nowrap">
                      {t("Generate", "توليد")}
                    </Button>
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button onClick={handleCreate} disabled={loading} className="cursor-pointer">
                  {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                  {t("Create account", "إنشاء الحساب")}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {!clients?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("No client accounts yet. Create one to give a client access.", "لا توجد حسابات عملاء بعد. أنشئ حساباً لمنح عميل صلاحية الدخول.")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Card key={client.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="min-w-0">
                  <p className="font-medium">{client.full_name || t("No name", "بدون اسم")}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5" dir="ltr">
                    {client.username ? <><User size={13} /> {client.username}</> : client.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={() => { closeReset(); setResetFor(client); }}>
                    <KeyRound size={14} /> {t("Reset password", "كلمة المرور")}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {new Date(client.created_at).toLocaleDateString(isAr ? "ar-EG" : "en-US")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!resetFor} onOpenChange={(o) => (!o ? closeReset() : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resetSuccess
                ? t("Password updated", "تم تحديث كلمة المرور")
                : `${t("Reset password", "إعادة تعيين كلمة المرور")} — ${resetFor?.username || resetFor?.full_name}`}
            </DialogTitle>
          </DialogHeader>

          {resetSuccess ? (
            <div className="grid gap-4 py-2">
              <div className="flex items-center gap-2 text-green-500">
                <Check size={18} /> <span className="font-medium">{t("Password updated", "تم تحديث كلمة المرور")}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Share these credentials with the client. Keep the password safe — it isn't stored in readable form.",
                  "شارك هذه البيانات مع العميل. احتفظ بكلمة المرور — لا تُخزَّن بشكل يمكن قراءته لاحقاً."
                )}
              </p>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm font-mono">
                <div>{t("Username", "اسم المستخدم")}: <span className="font-semibold">{resetSuccess.username}</span></div>
                <div>{t("Password", "كلمة المرور")}: <span className="font-semibold">{resetSuccess.password}</span></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyResetCreds} className="gap-2 cursor-pointer">
                  {resetCopied ? <Check size={15} /> : <Copy size={15} />} {resetCopied ? t("Copied", "تم النسخ") : t("Copy", "نسخ")}
                </Button>
                <Button onClick={closeReset} className="cursor-pointer">{t("Done", "تم")}</Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>{t("New password", "كلمة المرور الجديدة")}</Label>
                <div className="flex gap-2">
                  <Input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    dir="ltr"
                    placeholder={t("Min 6 characters", "٦ أحرف على الأقل")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewPassword(genPassword())}
                    className="cursor-pointer whitespace-nowrap"
                  >
                    {t("Generate", "توليد")}
                  </Button>
                </div>
              </div>
              {resetError && <p className="text-sm text-destructive">{resetError}</p>}
              <Button
                onClick={handleReset}
                disabled={loading || newPassword.length < 6}
                className="cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                {t("Update password", "تحديث كلمة المرور")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
