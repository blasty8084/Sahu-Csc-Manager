import { useState, useRef, useEffect } from "react";
import {
  useGetProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar,
  getGetProfileQueryKey, getGetMeQueryKey,
  useGetPreferences, useUpdatePreferences, getGetPreferencesQueryKey,
  useGetSettings, useUpdateSettings, getGetSettingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { useForm } from "react-hook-form";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import {
  Camera, Trash2, User, Lock, Palette, Globe, LayoutDashboard,
  FolderOpen, AlertCircle, Building2, Settings2, UserPlus, ChevronRight,
} from "lucide-react";

// ─── Media picker dialog ────────────────────────────────────────────────────
interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => void;
}

function MediaPickerDialog({ open, onClose, onFileSelected }: MediaPickerProps) {
  const { toast } = useToast();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const ACCEPTED = "image/jpeg,image/png,image/webp,image/heic,image/heif";
  const MAX_MB = 5;

  const validate = (file: File) => {
    const okTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!okTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
      toast({ title: "Unsupported format", description: "JPG, PNG, WEBP or HEIC only.", variant: "destructive" });
      return false;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast({ title: "File too large", description: `Max ${MAX_MB} MB.`, variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !validate(file)) return;
    onFileSelected(file);
    onClose();
  };

  const pickCamera = () => { onClose(); setTimeout(() => cameraInputRef.current?.click(), 80); };
  const pickGallery = () => { onClose(); setTimeout(() => galleryInputRef.current?.click(), 80); };

  return (
    <>
      <input ref={cameraInputRef} type="file" accept={ACCEPTED} capture="user" className="hidden" onChange={handleChange} />
      <input ref={galleryInputRef} type="file" accept={ACCEPTED} className="hidden" onChange={handleChange} />
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Update Profile Picture</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3 pt-1">
            <button type="button" onClick={pickCamera} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-accent hover:border-primary/40 transition-colors text-left group">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Camera size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Take a Photo</p>
                <p className="text-xs text-muted-foreground">Open camera to take a new photo</p>
              </div>
            </button>
            <button type="button" onClick={pickGallery} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-accent hover:border-primary/40 transition-colors text-left group">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <FolderOpen size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Choose from Gallery</p>
                <p className="text-xs text-muted-foreground">Browse photos on this device</p>
              </div>
            </button>
          </div>
          <div className="flex items-start gap-2 mt-1 p-3 rounded-lg bg-muted/50">
            <AlertCircle size={13} className="text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">JPG, PNG, WEBP or HEIC · max {MAX_MB} MB</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Registration control (admin) ───────────────────────────────────────────
function RegistrationControlSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: regStatus, isLoading: regLoading } = useRegistrationStatus();
  const [toggling, setToggling] = useState(false);
  const isOpen = regStatus?.open ?? false;

  const toggleRegistration = async (open: boolean) => {
    setToggling(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/settings/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ open }),
      });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["registration-status"] });
      toast({
        title: open ? "Registration Opened" : "Registration Closed",
        description: open ? "New users can now register." : "New registrations are disabled.",
      });
    } catch {
      toast({ title: "Failed to update registration", variant: "destructive" });
    } finally {
      setToggling(false);
    }
  };

  if (regLoading) return <Skeleton className="h-16 w-full rounded-xl" />;

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${isOpen ? "border-green-200 bg-green-50/50 dark:border-green-900/40 dark:bg-green-950/20" : "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20"}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isOpen ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
          {isOpen
            ? <UserPlus size={16} className="text-green-600 dark:text-green-400" />
            : <Lock size={16} className="text-red-500 dark:text-red-400" />}
        </div>
        <div>
          <p className="text-sm font-semibold">{isOpen ? "Registrations Open" : "Registrations Closed"}</p>
          <p className="text-xs text-muted-foreground">{isOpen ? "New users can submit registration requests." : "The registration page will show a closed message."}</p>
        </div>
      </div>
      <Switch checked={isOpen} onCheckedChange={toggleRegistration} disabled={toggling} className="shrink-0 ml-4" />
    </div>
  );
}

// ─── Nav items ───────────────────────────────────────────────────────────────
type TabId = "profile" | "security" | "preferences" | "business" | "system";

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "profile",      label: "My Profile",     icon: <User size={16} /> },
  { id: "security",     label: "Security",        icon: <Lock size={16} /> },
  { id: "preferences",  label: "Preferences",     icon: <Palette size={16} /> },
  { id: "business",     label: "Business Info",   icon: <Building2 size={16} />, adminOnly: true },
  { id: "system",       label: "System",          icon: <Settings2 size={16} />, adminOnly: true },
];

// ─── Shared field components ─────────────────────────────────────────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function Profile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const qc = useQueryClient();
  const isAdmin = user?.role === "admin";

  const [tab, setTab] = useState<TabId>("profile");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [mobileSection, setMobileSection] = useState<TabId | null>(null);

  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: prefs, isLoading: prefsLoading } = useGetPreferences();
  const { data: settings, isLoading: settingsLoading } = useGetSettings();

  const updateMut = useUpdateProfile();
  const updatePrefsMut = useUpdatePreferences();
  const updateSettingsMut = useUpdateSettings();
  const uploadAvatarMut = useUploadAvatar();
  const deleteAvatarMut = useDeleteAvatar();

  const isLoading = profileLoading || prefsLoading || (isAdmin && settingsLoading);

  const profileForm = useForm({ defaultValues: { fullName: "", email: "", mobile: "", bio: "", address: "" } });
  const passwordForm = useForm({ defaultValues: { currentPassword: "", password: "", confirmPassword: "" } });
  const prefsForm = useForm({
    defaultValues: { theme: "light" as "light" | "dark", language: "en" as "en" | "hi" | "or", dashboardLayout: "default" }
  });
  const settingsForm = useForm({
    defaultValues: {
      businessName: "", businessAddress: "", businessMobile: "", businessEmail: "", businessWebsite: "",
      language: "en", theme: "light", currency: "INR", autoBackup: false, backupFrequencyDays: 7,
    }
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        fullName: profile.fullName ?? "",
        email: profile.email,
        mobile: profile.mobile ?? "",
        bio: profile.bio ?? "",
        address: profile.address ?? "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (prefs) {
      prefsForm.reset({ theme: prefs.theme, language: prefs.language, dashboardLayout: prefs.dashboardLayout });
    }
  }, [prefs]);

  useEffect(() => {
    if (settings) {
      settingsForm.reset({
        businessName: settings.businessName,
        businessAddress: settings.businessAddress,
        businessMobile: settings.businessMobile,
        businessEmail: settings.businessEmail ?? "",
        businessWebsite: (settings as any).businessWebsite ?? "",
        language: settings.language,
        theme: settings.theme,
        currency: settings.currency,
        autoBackup: settings.autoBackup,
        backupFrequencyDays: settings.backupFrequencyDays,
      });
    }
  }, [settings]);

  const invalidateProfile = () => {
    qc.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
  };

  const onSaveProfile = profileForm.handleSubmit(async (values) => {
    try {
      await updateMut.mutateAsync({ data: values as any });
      invalidateProfile();
      toast({ title: "Profile updated successfully" });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  });

  const onChangePassword = passwordForm.handleSubmit(async (values) => {
    if (values.password !== values.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    try {
      await updateMut.mutateAsync({ data: { currentPassword: values.currentPassword, password: values.password } as any });
      invalidateProfile();
      passwordForm.reset();
      toast({ title: "Password changed successfully" });
    } catch (e: any) {
      toast({ title: e?.response?.data?.error ?? "Failed to change password", variant: "destructive" });
    }
  });

  const onSavePreferences = prefsForm.handleSubmit(async (values) => {
    try {
      await updatePrefsMut.mutateAsync({ data: values });
      qc.invalidateQueries({ queryKey: getGetPreferencesQueryKey() });
      setTheme(values.theme);
      toast({ title: "Preferences saved successfully" });
    } catch {
      toast({ title: "Failed to save preferences", variant: "destructive" });
    }
  });

  const onSaveSettings = settingsForm.handleSubmit(async (values) => {
    try {
      await updateSettingsMut.mutateAsync({ data: values as any });
      qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      setTheme(values.theme as "light" | "dark");
      toast({ title: "Settings saved successfully" });
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  });

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      try {
        await uploadAvatarMut.mutateAsync({ data: { profilePicture: dataUrl } });
        invalidateProfile();
        toast({ title: "Profile picture updated" });
      } catch {
        setAvatarPreview(null);
        toast({ title: "Failed to upload picture", variant: "destructive" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatarMut.mutateAsync();
      setAvatarPreview(null);
      invalidateProfile();
      toast({ title: "Profile picture removed" });
    } catch {
      toast({ title: "Failed to remove picture", variant: "destructive" });
    }
  };

  const displayPicture = avatarPreview || profile?.profilePicture;
  const initials = (profile?.fullName || profile?.username || "U").charAt(0).toUpperCase();
  const visibleTabs = NAV_ITEMS.filter(n => !n.adminOnly || isAdmin);

  // ── Skeleton ──
  if (isLoading) {
    return (
      <Layout>
        <div className="flex gap-6 max-w-5xl">
          <div className="hidden md:flex w-52 shrink-0 flex-col gap-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
          </div>
          <div className="flex-1 space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
          </div>
        </div>
      </Layout>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DESKTOP layout: dark sidebar + card grid (V4)
  // MOBILE layout: iOS-settings scroll (V3)
  // ─────────────────────────────────────────────────────────────────────────

  // ── Section content (shared between desktop + mobile) ──
  const sectionContent: Record<TabId, React.ReactNode> = {

    // ── PROFILE ──
    profile: (
      <div className="space-y-4">
        {/* Avatar hero card */}
        <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar className="h-16 w-16 border-2 border-border">
              {displayPicture ? <AvatarImage src={displayPicture} alt="Profile" className="object-cover" /> : null}
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="absolute -bottom-1 -right-1 rounded-full bg-orange-500 text-white p-1.5 shadow-md hover:bg-orange-600 transition-colors"
              title="Change profile picture"
            >
              <Camera size={11} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate">{profile?.fullName || profile?.username}</p>
            <p className="text-xs text-muted-foreground truncate mb-2">{profile?.email}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs capitalize">{profile?.role}</Badge>
              <Button size="sm" variant="outline" onClick={() => setShowPicker(true)} disabled={uploadAvatarMut.isPending} className="h-7 text-xs gap-1">
                <Camera size={11} />{uploadAvatarMut.isPending ? "Uploading…" : "Change"}
              </Button>
              {displayPicture && (
                <Button size="sm" variant="outline" className="h-7 text-xs text-destructive hover:bg-destructive/10 gap-1" onClick={handleDeleteAvatar} disabled={deleteAvatarMut.isPending}>
                  <Trash2 size={11} />Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Personal info form */}
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Personal Information</p>
          <form onSubmit={onSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full Name">
                <Input {...profileForm.register("fullName")} placeholder="Your full name" />
              </FormField>
              <FormField label="Username">
                <Input value={profile?.username ?? ""} disabled className="bg-muted/50" />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Email">
                <Input type="email" {...profileForm.register("email")} placeholder="your@email.com" />
              </FormField>
              <FormField label="Mobile">
                <Input {...profileForm.register("mobile")} placeholder="+91 XXXXX XXXXX" />
              </FormField>
            </div>
            <FormField label="Address">
              <Input {...profileForm.register("address")} placeholder="Your address" />
            </FormField>
            <FormField label="Bio">
              <Textarea {...profileForm.register("bio")} placeholder="Tell us about yourself..." className="resize-none" rows={2} />
            </FormField>
            <div className="flex justify-end">
              <Button type="submit" disabled={updateMut.isPending}>{updateMut.isPending ? "Saving…" : "Save Changes"}</Button>
            </div>
          </form>
        </div>
      </div>
    ),

    // ── SECURITY ──
    security: (
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Change Password</p>
          <form onSubmit={onChangePassword} className="space-y-4">
            <FormField label="Current Password">
              <Input type="password" {...passwordForm.register("currentPassword")} placeholder="Enter current password" />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="New Password">
                <Input type="password" {...passwordForm.register("password")} placeholder="Min 8 characters" />
              </FormField>
              <FormField label="Confirm Password">
                <Input type="password" {...passwordForm.register("confirmPassword")} placeholder="Repeat new password" />
              </FormField>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={updateMut.isPending}>{updateMut.isPending ? "Changing…" : "Change Password"}</Button>
            </div>
          </form>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Account Info</p>
          <p className="text-sm text-muted-foreground">
            Member since {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
              : "—"}
          </p>
        </div>
      </div>
    ),

    // ── PREFERENCES ──
    preferences: (
      <div className="rounded-xl border bg-card p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Display Preferences</p>
        <form onSubmit={onSavePreferences} className="space-y-5">
          {[
            { label: "Theme", icon: <Palette size={14} />, child: (
              <Select value={prefsForm.watch("theme")} onValueChange={(v) => prefsForm.setValue("theme", v as "light" | "dark")}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="light">☀️ Light</SelectItem><SelectItem value="dark">🌙 Dark</SelectItem></SelectContent>
              </Select>
            )},
            { label: "Language", icon: <Globe size={14} />, child: (
              <Select value={prefsForm.watch("language")} onValueChange={(v) => prefsForm.setValue("language", v as "en" | "hi" | "or")}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="hi">🇮🇳 हिंदी</SelectItem>
                  <SelectItem value="or">🇮🇳 ଓଡ଼ିଆ</SelectItem>
                </SelectContent>
              </Select>
            )},
            { label: "Dashboard Layout", icon: <LayoutDashboard size={14} />, child: (
              <Select value={prefsForm.watch("dashboardLayout")} onValueChange={(v) => prefsForm.setValue("dashboardLayout", v)}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="expanded">Expanded</SelectItem>
                </SelectContent>
              </Select>
            )},
          ].map((row, i, arr) => (
            <div key={row.label} className={`flex items-center justify-between ${i < arr.length - 1 ? "pb-5 border-b" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{row.icon}</span>
                <span className="text-sm font-medium">{row.label}</span>
              </div>
              {row.child}
            </div>
          ))}
          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={updatePrefsMut.isPending}>{updatePrefsMut.isPending ? "Saving…" : "Save Preferences"}</Button>
          </div>
        </form>
      </div>
    ),

    // ── BUSINESS (admin only) ──
    business: (
      <div className="rounded-xl border bg-card p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Business Information</p>
        <form onSubmit={onSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Business Name">
              <Input {...settingsForm.register("businessName")} />
            </FormField>
            <FormField label="Website">
              <Input {...settingsForm.register("businessWebsite")} placeholder="e.g. sahucsc.in" />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Mobile">
              <Input {...settingsForm.register("businessMobile")} />
            </FormField>
            <FormField label="Email">
              <Input type="email" {...settingsForm.register("businessEmail")} />
            </FormField>
          </div>
          <FormField label="Address">
            <Input {...settingsForm.register("businessAddress")} />
          </FormField>
          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={updateSettingsMut.isPending}>{updateSettingsMut.isPending ? "Saving…" : "Save Business Info"}</Button>
          </div>
        </form>
      </div>
    ),

    // ── SYSTEM (admin only) ──
    system: (
      <div className="space-y-4">
        {/* Registration control */}
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">User Registration</p>
          <RegistrationControlSection />
        </div>

        {/* System preferences */}
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">System Preferences</p>
          <form onSubmit={onSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Language">
                <Select value={settingsForm.watch("language")} onValueChange={(v) => settingsForm.setValue("language", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="or">Odia</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Theme">
                <Select value={settingsForm.watch("theme")} onValueChange={(v) => settingsForm.setValue("theme", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Currency">
                <Select value={settingsForm.watch("currency")} onValueChange={(v) => settingsForm.setValue("currency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            {/* Backup */}
            <div className="pt-2 border-t space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto Backup</p>
                  <p className="text-xs text-muted-foreground">Schedule regular database backups</p>
                </div>
                <Switch
                  checked={settingsForm.watch("autoBackup")}
                  onCheckedChange={(v) => settingsForm.setValue("autoBackup", v)}
                />
              </div>
              {settingsForm.watch("autoBackup") && (
                <FormField label="Frequency (days)">
                  <Input type="number" min={1} max={30} {...settingsForm.register("backupFrequencyDays", { valueAsNumber: true })} className="w-24" />
                </FormField>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateSettingsMut.isPending}>{updateSettingsMut.isPending ? "Saving…" : "Save Settings"}</Button>
            </div>
          </form>
        </div>
      </div>
    ),
  };

  return (
    <Layout>
      <MediaPickerDialog open={showPicker} onClose={() => setShowPicker(false)} onFileSelected={handleFileSelected} />

      {/* ════════════════════════════════════════════════════════
          DESKTOP — dark sidebar + content (md and up)
          ════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex gap-0 max-w-5xl -mx-0">
        {/* Dark sidebar */}
        <aside className="w-52 shrink-0 bg-slate-900 dark:bg-slate-950 rounded-xl mr-5 flex flex-col overflow-hidden">
          {/* User chip */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                {displayPicture ? <AvatarImage src={displayPicture} alt="Profile" className="object-cover" /> : null}
                <AvatarFallback className="text-sm font-bold bg-blue-700 text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.fullName || profile?.username}</p>
                <p className="text-[11px] text-white/40 truncate capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-2 flex flex-col gap-0.5">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 pt-2 pb-1">Settings</p>
            {visibleTabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                  tab === item.id
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5 font-normal"
                }`}
              >
                <span className={tab === item.id ? "text-white" : "text-white/40"}>{item.icon}</span>
                {item.label}
                {item.adminOnly && (
                  <span className="ml-auto text-[9px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">Admin</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <main className="flex-1 min-w-0">
          <h1 className="text-lg font-bold mb-4">{NAV_ITEMS.find(n => n.id === tab)?.label}</h1>
          {sectionContent[tab]}
        </main>
      </div>

      {/* ════════════════════════════════════════════════════════
          MOBILE — iOS-settings style (below md)
          ════════════════════════════════════════════════════════ */}
      <div className="md:hidden -mx-4">
        {mobileSection === null ? (
          /* Section list */
          <div>
            {/* Profile summary header */}
            <div className="flex flex-col items-center py-6 border-b bg-card/50">
              <div className="relative mb-3">
                <Avatar className="h-20 w-20 border-2 border-border">
                  {displayPicture ? <AvatarImage src={displayPicture} alt="Profile" className="object-cover" /> : null}
                  <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="absolute -bottom-1 -right-1 rounded-full bg-orange-500 text-white p-1.5 shadow-md"
                >
                  <Camera size={12} />
                </button>
              </div>
              <p className="font-bold text-lg">{profile?.fullName || profile?.username}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <Badge variant="outline" className="mt-1.5 text-xs capitalize">{profile?.role}</Badge>
            </div>

            {/* Navigation rows */}
            <div className="px-4 pt-4 space-y-1">
              {visibleTabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMobileSection(item.id)}
                  className="flex items-center justify-between w-full p-4 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      {item.adminOnly && <p className="text-xs text-orange-500 font-medium">Admin only</p>}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Section detail view */
          <div>
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b">
              <button
                onClick={() => setMobileSection(null)}
                className="flex items-center gap-1 text-primary text-sm font-medium hover:opacity-80"
              >
                <ChevronRight size={16} className="rotate-180" />
                Back
              </button>
              <h2 className="text-base font-bold">{NAV_ITEMS.find(n => n.id === mobileSection)?.label}</h2>
            </div>
            <div className="px-4 pt-4 pb-8">
              {sectionContent[mobileSection]}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
