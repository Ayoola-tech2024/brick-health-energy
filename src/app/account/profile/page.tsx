"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
import { getUserProfileAction, updateUserProfileAction } from "@/app/auth-actions";

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", state: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    document.title = "My Profile | Brick Health Energy";
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;
    if (!user) { router.push("/login?callbackUrl=/account/profile"); return; }

    getUserProfileAction(user.id).then((res) => {
      if (res.profile) {
        setForm({
          name: res.profile.name || user.name || "",
          phone: res.profile.phone || "",
          address: res.profile.address || "",
          city: res.profile.city || "",
          state: res.profile.state || "",
        });
      } else {
        setForm((prev) => ({ ...prev, name: user.name || "" }));
      }
    });
  }, [mounted, user, authLoading]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await updateUserProfileAction(user.id, form);
      if (res.error) { setError(res.error); }
      else { setSuccess(true); await refreshUser(); setTimeout(() => setSuccess(false), 3000); }
    } catch {
      setError("Failed to update profile");
    } finally { setSaving(false); }
  }

  if (!mounted || authLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded mx-auto mb-8" />
        <div className="h-64 bg-slate-200 rounded-lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold font-serif text-secondary flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            My Profile
          </h1>
          <p className="mt-1 text-muted-foreground font-light">Manage your personal information and shipping details.</p>
        </div>

        <Card className="rounded-sm border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-secondary">Personal Information</CardTitle>
            <CardDescription className="font-light">Update your name and contact details.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-4 text-sm">{error}</div>}
            {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 p-4 text-sm">Profile updated successfully!</div>}

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">Email</label>
                <div className="flex items-center gap-2 rounded-none h-12 border border-slate-200 bg-slate-50 px-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">Full Name</label>
                <Input className="rounded-none h-12" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={saving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">
                  <Phone className="inline h-4 w-4 mr-1" />Phone Number
                </label>
                <Input className="rounded-none h-12" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={saving} placeholder="+234..." />
              </div>

              <Separator className="my-6" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">Shipping Address</h3>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">
                  <MapPin className="inline h-4 w-4 mr-1" />Street Address
                </label>
                <Input className="rounded-none h-12" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} disabled={saving} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">City</label>
                  <Input className="rounded-none h-12" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} disabled={saving} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">State</label>
                  <Input className="rounded-none h-12" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} disabled={saving} />
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full rounded-none h-14 text-base tracking-widest uppercase">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><Save className="h-5 w-5" />Save Changes</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
