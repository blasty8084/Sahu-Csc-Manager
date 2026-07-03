import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useGetProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar,
  getGetProfileQueryKey, getGetMeQueryKey,
  useGetPreferences, useUpdatePreferences, getGetPreferencesQueryKey,
  useGetSettings, useUpdateSettings, getGetSettingsQueryKey,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionLoader } from "@/components/section-loader";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { useForm } from "react-hook-form";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import { setLanguage } from "@/lib/i18n";
import {
  Camera, Trash2, User, Lock, Palette, Globe, LayoutDashboard,
  FolderOpen, AlertCircle, Building2, Settings2, UserPlus,
  ChevronRight, Monitor, Smartphone, Tablet, MapPin, Clock,
  LogOut, ShieldCheck, ShieldAlert, Loader2, RefreshCw, Wifi,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SessionEntry {
  id: number; sessionId: string; deviceInfo: string; browser: string;
  os: string; ipAddress: string; rememberMe: boolean; isCurrent: boolean;
  lastActivity: string; expiresAt: string; createdAt: string;
}

// ─── Session helpers ─────────────────────────────────────────────────────────
function deviceIcon(os: string) {
  if (/android.*mobile|iphone|ipod|windows phone/i.test(os)) return Smartphone;
  if (/ipad|tablet|android(?!.*mobile)/i.test(os)) return Tablet;
  return Monitor;
}
function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}
function formatExpiry(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `Expires in ${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `Expires in ${hours}h ${mins}m` : `Expires in ${mins}m`;
}
async function apiFetch(path: string, options?: RequestInit) {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  const res = await fetch(`${base}/api${path}`, {
    credentials: "include", headers: { "Content-Type": "application/json" }, ...options,
  });
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error ?? "Request failed"); }
  return res.json().catch(() => ({}));
}

// ─── Media picker dialog ─────────────────────────────────────────────────────
function MediaPickerDialog({ open, onClose, onFileSelected }: {
  open: boolean; onClose: () => void; onFileSelected: (f: File) => void;
}) {
  const { toast } = useToast();
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const ACCEPTED = "image/jpeg,image/png,image/webp,image/heic,image/heif";

  const validate = (file: File) => {
    const ok = ["image/jpeg","image/png","image/webp","image/heic","image/heif"];
    if (!ok.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
      toast({ title: "Unsupported format", description: "JPG, PNG, WEBP or HEIC only.", variant: "destructive" }); return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5 MB.", variant: "destructive" }); return false;
    }
    return true;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file || !validate(file)) return;
    onFileSelected(file); onClose();
  };
  return (
    <>
      <input ref={camRef} type="file" accept={ACCEPTED} capture="user" className="hidden" onChange={handleChange} />
      <input ref={galRef} type="file" accept={ACCEPTED} className="hidden" onChange={handleChange} />
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Update Profile Picture</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3 pt-1">
            <button type="button" onClick={() => { onClose(); setTimeout(() => camRef.current?.click(), 80); }}
              className="flex items-center gap-4 p-4 rounded-xl border hover:bg-accent hover:border-primary/40 transition-colors text-left group">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Camera size={20} className="text-primary" />
              </div>
              <div><p className="font-medium text-sm">Take a Photo</p><p className="text-xs text-muted-foreground">Open camera</p></div>
            </button>
            <button type="button" onClick={() => { onClose(); setTimeout(() => galRef.current?.click(), 80); }}
              className="flex items-center gap-4 p-4 rounded-xl border hover:bg-accent hover:border-primary/40 transition-colors text-left group">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <FolderOpen size={20} className="text-primary" />
              </div>
              <div><p className="font-medium text-sm">Choose from Gallery</p><p className="text-xs text-muted-foreground">Browse photos on this device</p></div>
            </button>
          </div>
          <div className="flex items-start gap-2 mt-1 p-3 rounded-lg bg-muted/50">
            <AlertCircle size={13} className="text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">JPG, PNG, WEBP or HEIC · max 5 MB</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Registration control ─────────────────────────────────────────────────────
function RegistrationControlSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: regStatus, isLoading: regLoading } = useRegistrationStatus();
  const [toggling, setToggling] = useState(false);
  const isOpen = regStatus?.open ?? false;

  const toggle = async (open: boolean) => {
    setToggling(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/admin/settings/registration`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ open }),
      });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["registration-status"] });
      toast({ title: open ? "Registration Opened" : "Registration Closed" });
    } catch { toast({ title: "Failed to update registration", variant: "destructive" }); }
    finally { setToggling(false); }
  };

  if (regLoading) return <SectionLoader size="sm" minHeight={64} />;
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${isOpen ? "border-green-200 bg-green-50/50 dark:border-green-900/40 dark:bg-green-950/20" : "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20"}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isOpen ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
          {isOpen ? <UserPlus size={16} className="text-green-600 dark:text-green-400" /> : <Lock size={16} className="text-red-500 dark:text-red-400" />}
        </div>
        <div>
          <p className="text-sm font-semibold">{isOpen ? "Registrations Open" : "Registrations Closed"}</p>
          <p className="text-xs text-muted-foreground">{isOpen ? "New users can submit registration requests." : "Registration page shows a closed message."}</p>
        </div>
      </div>
      <Switch checked={isOpen} onCheckedChange={toggle} disabled={toggling} className="shrink-0 ml-4" />
    </div>
  );
}

// ─── V5 Command Center card (desktop) ────────────────────────────────────────
function CmdCard({ title, icon, adminOnly, action, children }: {
  title: string; icon: React.ReactNode; adminOnly?: boolean; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border bg-card shadow-sm overflow-hidden ${adminOnly ? "border-orange-200 dark:border-orange-900/40" : ""}`}>
      <div className={`flex items-center justify-between px-5 py-3.5 border-b ${adminOnly ? "bg-orange-50/60 dark:bg-orange-950/20" : "bg-muted/30"}`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${adminOnly ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400" : "bg-primary/10 text-primary"}`}>
            {icon}
          </div>
          <h2 className="text-sm font-bold">{title}</h2>
          {adminOnly && <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">Admin</span>}
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}


function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

// ─── Nav sections config ──────────────────────────────────────────────────────

// Mobile section groups
type MobileTab = "profile" | "security" | "preferences" | "business" | "system";
interface MobileNavItem { id: MobileTab; label: string; icon: React.ReactNode; adminOnly?: boolean; }
const MOBILE_NAV: MobileNavItem[] = [
  { id: "profile",     label: "My Profile",   icon: <User size={16} /> },
  { id: "security",    label: "Security",      icon: <Lock size={16} /> },
  { id: "preferences", label: "Preferences",  icon: <Palette size={16} /> },
  { id: "business",    label: "Business Info", icon: <Building2 size={16} />, adminOnly: true },
  { id: "system",      label: "System",        icon: <Settings2 size={16} />, adminOnly: true },
];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Profile() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { setTheme } = useTheme();
  const qc = useQueryClient();
  const isAdmin = user?.role === "admin";

  // Mobile drill-in
  const [mobileSection, setMobileSection] = useState<MobileTab | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  // Sessions dialogs
  const [revokeId, setRevokeId] = useState<number | null>(null);
  const [revokeOthersOpen, setRevokeOthersOpen] = useState(false);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  // ── Data hooks ──
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: prefs, isLoading: prefsLoading } = useGetPreferences();
  const { data: settings, isLoading: settingsLoading } = useGetSettings();
  const { data: sessions = [], isLoading: sessionsLoading, refetch: refetchSessions, isFetching: sessionsFetching } = useQuery<SessionEntry[]>({
    queryKey: ["sessions"],
    queryFn: () => apiFetch("/sessions"),
    refetchInterval: 30_000,
  });

  // ── Mutations ──
  const updateMut = useUpdateProfile();
  const updatePrefsMut = useUpdatePreferences();
  const updateSettingsMut = useUpdateSettings();
  const uploadAvatarMut = useUploadAvatar();
  const deleteAvatarMut = useDeleteAvatar();

  const revokeMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/sessions/${id}`, { method: "DELETE" }),
    onSuccess: (data: any) => { qc.invalidateQueries({ queryKey: ["sessions"] }); toast.success("Session revoked"); if (data?.redirect) logout(); },
    onError: (e: any) => toast({ variant: "destructive", title: e.message }),
  });
  const revokeOthersMut = useMutation({
    mutationFn: () => apiFetch("/sessions/others", { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sessions"] }); toast.success("All other sessions revoked"); },
    onError: (e: any) => toast({ variant: "destructive", title: e.message }),
  });
  const revokeAllMut = useMutation({
    mutationFn: () => apiFetch("/sessions/all", { method: "DELETE" }),
    onSuccess: () => { toast.success("Logged out everywhere"); logout(); },
    onError: (e: any) => toast({ variant: "destructive", title: e.message }),
  });

  // ── Forms ──
  const profileForm = useForm({ defaultValues: { fullName: "", email: "", mobile: "", bio: "", address: "" } });
  const passwordForm = useForm({ defaultValues: { currentPassword: "", password: "", confirmPassword: "" } });
  const prefsForm = useForm({ defaultValues: { theme: "light" as "light"|"dark", language: "en" as "en"|"hi"|"or", dashboardLayout: "default" } });
  const LANG_META: Record<string, { flag: string; name: string; script: string }> = {
    en: { flag: "🇬🇧", name: "English",  script: "English"  },
    hi: { flag: "🇮🇳", name: "हिंदी",    script: "Hindi"    },
    or: { flag: "🇮🇳", name: "ଓଡ଼ିଆ",   script: "Odia"     },
  };
  const currentLang = LANG_META[prefsForm.watch("language")] ?? LANG_META["en"];
  const settingsForm = useForm({
    defaultValues: {
      businessName: "", businessAddress: "", businessMobile: "", businessEmail: "", businessWebsite: "",
      language: "en", theme: "light", currency: "INR", autoBackup: false, backupFrequencyDays: 7,
    }
  });

  useEffect(() => { if (profile) profileForm.reset({ fullName: profile.fullName ?? "", email: profile.email, mobile: profile.mobile ?? "", bio: profile.bio ?? "", address: profile.address ?? "" }); }, [profile]);
  useEffect(() => { if (prefs) { prefsForm.reset({ theme: prefs.theme, language: prefs.language, dashboardLayout: prefs.dashboardLayout }); if (prefs.language) setLanguage(prefs.language); } }, [prefs]);
  useEffect(() => {
    if (settings) settingsForm.reset({
      businessName: settings.businessName, businessAddress: settings.businessAddress,
      businessMobile: settings.businessMobile, businessEmail: settings.businessEmail ?? "",
      businessWebsite: (settings as any).businessWebsite ?? "",
      language: settings.language, theme: settings.theme, currency: settings.currency,
      autoBackup: settings.autoBackup, backupFrequencyDays: settings.backupFrequencyDays,
    });
  }, [settings]);

  const invalidateProfile = () => { qc.invalidateQueries({ queryKey: getGetProfileQueryKey() }); qc.invalidateQueries({ queryKey: getGetMeQueryKey() }); };

  const onSaveProfile = profileForm.handleSubmit(async (v) => {
    try { await updateMut.mutateAsync({ data: v as any }); invalidateProfile(); toast.success("Profile updated"); }
    catch { toast({ title: "Failed to update profile", variant: "destructive" }); }
  });
  const onChangePassword = passwordForm.handleSubmit(async (v) => {
    if (v.password !== v.confirmPassword) { toast({ title: "Passwords do not match", variant: "destructive" }); return; }
    try { await updateMut.mutateAsync({ data: { currentPassword: v.currentPassword, password: v.password } as any }); invalidateProfile(); passwordForm.reset(); toast.success("Password changed"); }
    catch (e: any) { toast({ title: e?.response?.data?.error ?? "Failed to change password", variant: "destructive" }); }
  });
  const onSavePreferences = prefsForm.handleSubmit(async (v) => {
    try { await updatePrefsMut.mutateAsync({ data: v }); qc.invalidateQueries({ queryKey: getGetPreferencesQueryKey() }); setTheme(v.theme); toast.success("Preferences saved"); }
    catch { toast({ title: "Failed to save preferences", variant: "destructive" }); }
  });
  const onSaveSettings = settingsForm.handleSubmit(async (v) => {
    try { await updateSettingsMut.mutateAsync({ data: v as any }); qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() }); setTheme(v.theme as "light"|"dark"); toast.success("Settings saved"); }
    catch { toast({ title: "Failed to save settings", variant: "destructive" }); }
  });
  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string; setAvatarPreview(dataUrl);
      try { await uploadAvatarMut.mutateAsync({ data: { profilePicture: dataUrl } }); invalidateProfile(); toast.success("Profile picture updated"); }
      catch { setAvatarPreview(null); toast({ title: "Failed to upload picture", variant: "destructive" }); }
    };
    reader.readAsDataURL(file);
  };
  const handleDeleteAvatar = async () => {
    try { await deleteAvatarMut.mutateAsync(); setAvatarPreview(null); invalidateProfile(); toast.success("Profile picture removed"); }
    catch { toast({ title: "Failed to remove picture", variant: "destructive" }); }
  };

  const displayPicture = avatarPreview || profile?.profilePicture;
  const initials = (profile?.fullName || profile?.username || "U").charAt(0).toUpperCase();
  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);
  // ── Loading — only block if we have zero profile data yet (first visit) ──
  if (profileLoading && !profile) {
    return (
      <Layout>
        <SectionLoader message="Loading profile…" minHeight="60vh" />
      </Layout>
    );
  }

  // ── Sessions sub-content ──
  const sessionsContent = (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { val: sessions.length, label: "Active Sessions", color: "text-primary" },
          { val: user?.role ?? "—", label: "Account Role", color: "capitalize" },
          { val: currentSession?.rememberMe ? "30d" : "8h", label: "Session Length", color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl border bg-background text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bulk actions */}
      {sessions.length > 0 && (
        <div className="space-y-2">
          {otherSessions.length > 0 && (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/20">
              <div>
                <p className="font-semibold text-sm">Sign out other devices</p>
                <p className="text-xs text-muted-foreground mt-0.5">{otherSessions.length} other session{otherSessions.length !== 1 ? "s" : ""} active</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setRevokeOthersOpen(true)} disabled={revokeOthersMut.isPending} className="gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-400">
                {revokeOthersMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                Logout Others
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-destructive/20 bg-destructive/5">
            <div>
              <p className="font-semibold text-sm text-destructive">Sign out everywhere</p>
              <p className="text-xs text-muted-foreground mt-0.5">Logs out this device too</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setRevokeAllOpen(true)} disabled={revokeAllMut.isPending} className="gap-1.5">
              {revokeAllMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
              Logout All
            </Button>
          </div>
        </div>
      )}

      {sessionsLoading && <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-primary" /></div>}

      {/* Current session */}
      {currentSession && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={14} className="text-primary" />
            <span className="text-sm font-semibold">Current Session</span>
            <Badge variant="default" className="text-[10px] px-1.5 py-0 ml-1">This Device</Badge>
          </div>
          <SessionCard session={currentSession} />
        </div>
      )}

      {/* Other sessions */}
      {otherSessions.map(s => (
        <div key={s.id} className="rounded-xl border bg-card p-4 flex items-start gap-3">
          <div className="flex-1 min-w-0"><SessionCard session={s} /></div>
          <Button variant="ghost" size="sm" onClick={() => setRevokeId(s.id)} disabled={revokeMut.isPending} className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 shrink-0 mt-0.5">
            <Trash2 size={13} />Revoke
          </Button>
        </div>
      ))}

      {!sessionsLoading && sessions.length === 0 && (
        <div className="rounded-xl border bg-card p-10 text-center">
          <ShieldCheck size={32} className="text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No active sessions found</p>
        </div>
      )}

      {/* Security tip */}
      <p className="text-xs text-muted-foreground leading-relaxed p-3 rounded-lg bg-muted/50 border">
        <strong className="text-foreground">Security tip:</strong> Revoke sessions you don't recognise and change your password.
        Standard sessions expire after <strong>8h</strong>; "Remember Me" sessions after <strong>30 days</strong>.
        Account locks after <strong>5 failed attempts</strong>.
      </p>
    </div>
  );

  // ── Mobile section content ──
  const mobileSectionContent: Record<MobileTab, React.ReactNode> = {
    profile: (
      <div className="space-y-4">
        {/* Avatar */}
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar className="h-16 w-16 border-2 border-border">
              {displayPicture ? <AvatarImage src={displayPicture} alt="Profile" className="object-cover" /> : null}
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <button type="button" onClick={() => setShowPicker(true)} className="absolute -bottom-1 -right-1 rounded-full bg-orange-500 text-white p-1.5 shadow">
              <Camera size={11} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate">{profile?.fullName || profile?.username}</p>
            <p className="text-xs text-muted-foreground truncate mb-2">{profile?.email}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs capitalize">{profile?.role}</Badge>
              <Button size="sm" variant="outline" onClick={() => setShowPicker(true)} className="h-7 text-xs gap-1">
                <Camera size={11} />{uploadAvatarMut.isPending ? "Uploading…" : "Change"}
              </Button>
              {displayPicture && <Button size="sm" variant="outline" className="h-7 text-xs text-destructive gap-1" onClick={handleDeleteAvatar}><Trash2 size={11} />Remove</Button>}
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Personal Information</p>
          <form onSubmit={onSaveProfile} className="space-y-3">
            <FormField label="Full Name"><Input {...profileForm.register("fullName")} /></FormField>
            <FormField label="Username"><Input value={profile?.username ?? ""} disabled className="bg-muted/50" /></FormField>
            <FormField label="Email"><Input type="email" {...profileForm.register("email")} /></FormField>
            <FormField label="Mobile"><Input {...profileForm.register("mobile")} /></FormField>
            <FormField label="Address"><Input {...profileForm.register("address")} /></FormField>
            <FormField label="Bio"><Textarea {...profileForm.register("bio")} className="resize-none" rows={2} /></FormField>
            <Button type="submit" className="w-full" disabled={updateMut.isPending}>{updateMut.isPending ? "Saving…" : "Save Changes"}</Button>
          </form>
        </div>
      </div>
    ),
    security: (
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Change Password</p>
          <form onSubmit={onChangePassword} className="space-y-3">
            <FormField label="Current Password"><Input type="password" {...passwordForm.register("currentPassword")} /></FormField>
            <FormField label="New Password"><Input type="password" {...passwordForm.register("password")} /></FormField>
            <FormField label="Confirm Password"><Input type="password" {...passwordForm.register("confirmPassword")} /></FormField>
            <Button type="submit" className="w-full" disabled={updateMut.isPending}>{updateMut.isPending ? "Changing…" : "Change Password"}</Button>
          </form>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sessions</p>
            <Button variant="ghost" size="sm" onClick={() => refetchSessions()} disabled={sessionsFetching} className="gap-1 h-7 text-xs">
              <RefreshCw size={12} className={sessionsFetching ? "animate-spin" : ""} />Refresh
            </Button>
          </div>
          {sessionsLoading ? <SectionLoader size="sm" minHeight={80} /> : (
            <div className="space-y-2">
              {sessions.map(s => (
                <div key={s.id} className={`flex items-start gap-3 p-3 rounded-lg border ${s.isCurrent ? "border-primary/25 bg-primary/5" : "border-border bg-background"}`}>
                  <div className="flex-1 min-w-0"><SessionCard session={s} compact /></div>
                  {!s.isCurrent && (
                    <Button variant="ghost" size="sm" onClick={() => setRevokeId(s.id)} className="text-destructive hover:bg-destructive/10 h-7 text-xs gap-1 shrink-0">
                      <Trash2 size={12} />Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
          {sessions.length > 1 && (
            <div className="flex gap-2 mt-3 pt-3 border-t">
              {otherSessions.length > 0 && (
                <Button variant="outline" size="sm" className="flex-1 text-xs border-orange-300 text-orange-700" onClick={() => setRevokeOthersOpen(true)}>
                  <LogOut size={12} className="mr-1" />Logout Others
                </Button>
              )}
              <Button variant="destructive" size="sm" className="flex-1 text-xs" onClick={() => setRevokeAllOpen(true)}>
                <ShieldAlert size={12} className="mr-1" />Logout All
              </Button>
            </div>
          )}
        </div>
      </div>
    ),
    preferences: (
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Preferences</p>
        <form onSubmit={onSavePreferences} className="space-y-4">
          {[
            { label:"Theme", icon:<Palette size={14} />, child:<Select value={prefsForm.watch("theme")} onValueChange={v => prefsForm.setValue("theme", v as "light"|"dark")}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">☀️ Light</SelectItem><SelectItem value="dark">🌙 Dark</SelectItem></SelectContent></Select> },
            { label:"Language", icon:<Globe size={14} />, badge:<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">{currentLang.flag} {currentLang.name}</span>, child:<Select value={prefsForm.watch("language")} onValueChange={v => { prefsForm.setValue("language", v as "en"|"hi"|"or"); setLanguage(v); }}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">🇬🇧 English</SelectItem><SelectItem value="hi">🇮🇳 हिंदी</SelectItem><SelectItem value="or">🇮🇳 ଓଡ଼ିଆ</SelectItem></SelectContent></Select> },
            { label:"Dashboard", icon:<LayoutDashboard size={14} />, child:<Select value={prefsForm.watch("dashboardLayout")} onValueChange={v => prefsForm.setValue("dashboardLayout", v)}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Default</SelectItem><SelectItem value="compact">Compact</SelectItem><SelectItem value="expanded">Expanded</SelectItem></SelectContent></Select> },
          ].map((row: any, i, arr) => (
            <div key={row.label} className={`flex items-center justify-between ${i < arr.length-1 ? "pb-4 border-b" : ""}`}>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-medium">{row.icon}{row.label}</div>
                {row.badge && <div>{row.badge}</div>}
              </div>
              {row.child}
            </div>
          ))}
          <Button type="submit" className="w-full mt-1" disabled={updatePrefsMut.isPending}>{updatePrefsMut.isPending ? "Saving…" : "Save Preferences"}</Button>
        </form>
      </div>
    ),
    business: (
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Business Information</p>
        <form onSubmit={onSaveSettings} className="space-y-3">
          <FormField label="Business Name"><Input {...settingsForm.register("businessName")} /></FormField>
          <FormField label="Mobile"><Input {...settingsForm.register("businessMobile")} /></FormField>
          <FormField label="Email"><Input type="email" {...settingsForm.register("businessEmail")} /></FormField>
          <FormField label="Website"><Input {...settingsForm.register("businessWebsite")} /></FormField>
          <FormField label="Address"><Input {...settingsForm.register("businessAddress")} /></FormField>
          <Button type="submit" className="w-full mt-1" disabled={updateSettingsMut.isPending}>{updateSettingsMut.isPending ? "Saving…" : "Save Business Info"}</Button>
        </form>
      </div>
    ),
    system: (
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">User Registration</p>
          <RegistrationControlSection />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">System Preferences</p>
          <form onSubmit={onSaveSettings} className="space-y-4">
            <FormField label="Language">
              <Select value={settingsForm.watch("language")} onValueChange={v => settingsForm.setValue("language", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="hi">Hindi</SelectItem><SelectItem value="or">Odia</SelectItem></SelectContent>
              </Select>
            </FormField>
            <FormField label="Theme">
              <Select value={settingsForm.watch("theme")} onValueChange={v => settingsForm.setValue("theme", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent>
              </Select>
            </FormField>
            <FormField label="Currency">
              <Select value={settingsForm.watch("currency")} onValueChange={v => settingsForm.setValue("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="INR">INR (₹)</SelectItem><SelectItem value="USD">USD ($)</SelectItem></SelectContent>
              </Select>
            </FormField>
            <div className="pt-2 border-t space-y-3">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Auto Backup</p><p className="text-xs text-muted-foreground">Scheduled DB backups</p></div>
                <Switch checked={settingsForm.watch("autoBackup")} onCheckedChange={v => settingsForm.setValue("autoBackup", v)} />
              </div>
              {settingsForm.watch("autoBackup") && (
                <FormField label="Frequency (days)"><Input type="number" min={1} max={30} {...settingsForm.register("backupFrequencyDays", { valueAsNumber: true })} className="w-24" /></FormField>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={updateSettingsMut.isPending}>{updateSettingsMut.isPending ? "Saving…" : "Save Settings"}</Button>
          </form>
        </div>
      </div>
    ),
  };

  return (
    <Layout>
      <MediaPickerDialog open={showPicker} onClose={() => setShowPicker(false)} onFileSelected={handleFileSelected} />

      {/* ─── Confirm dialogs ─────────────────────────────────────────── */}
      <AlertDialog open={revokeId !== null} onOpenChange={() => setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Revoke Session</AlertDialogTitle><AlertDialogDescription>This will immediately log out the selected device.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { if (revokeId !== null) revokeMut.mutate(revokeId); setRevokeId(null); }}>Revoke</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={revokeOthersOpen} onOpenChange={setRevokeOthersOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Logout All Other Devices</AlertDialogTitle><AlertDialogDescription>Signs out {otherSessions.length} other session{otherSessions.length !== 1 ? "s" : ""}. Your current session stays active.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { revokeOthersMut.mutate(); setRevokeOthersOpen(false); }}>Logout Others</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Logout Everywhere</AlertDialogTitle><AlertDialogDescription>Signs out all {sessions.length} session{sessions.length !== 1 ? "s" : ""} including this device. You'll be redirected to login.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { revokeAllMut.mutate(); setRevokeAllOpen(false); }}>Logout Everywhere</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══════════════════════════════════════════════════════════════
          DESKTOP — V5: Command Center (md+)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Full-width command banner — breaks out of Layout padding */}
        <div
          className="-mx-8 -mt-8 mb-6 px-8 py-6"
          style={{ background: "linear-gradient(135deg, #0b2c60 0%, #0d3270 55%, #0f3872 100%)" }}
        >
          <div className="flex items-center justify-between gap-6">
            {/* Left: avatar + identity */}
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <Avatar className="h-20 w-20 border-2 border-white/20">
                  {displayPicture ? <AvatarImage src={displayPicture} alt="Profile" className="object-cover" /> : null}
                  <AvatarFallback className="text-3xl font-bold bg-[#f97316] text-white">{initials}</AvatarFallback>
                </Avatar>
                <button type="button" onClick={() => setShowPicker(true)}
                  className="absolute -bottom-1 -right-1 rounded-full bg-[#f97316] text-white p-1.5 shadow-md hover:bg-orange-600 transition-colors">
                  <Camera size={12} />
                </button>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{profile?.fullName || profile?.username}</h1>
                <p className="text-sm text-white/55 mt-0.5">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
                    style={{ background: "rgba(249,115,22,0.18)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.30)" }}>
                    {profile?.role}
                  </span>
                  {profile?.mobile && <span className="text-xs text-white/40">{profile.mobile}</span>}
                  <div className="flex gap-2 ml-1">
                    <Button size="sm" onClick={() => setShowPicker(true)} disabled={uploadAvatarMut.isPending}
                      className="h-7 text-xs gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                      <Camera size={11} />{uploadAvatarMut.isPending ? "Uploading…" : "Change Photo"}
                    </Button>
                    {displayPicture && (
                      <Button size="sm" onClick={handleDeleteAvatar} disabled={deleteAvatarMut.isPending}
                        className="h-7 text-xs gap-1 bg-white/10 hover:bg-white/20 text-white/70 border border-white/20">
                        <Trash2 size={11} />Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: KPI strip */}
            <div className="flex items-center gap-3 shrink-0">
              {[
                { val: String(sessions.length), label: "Active Sessions", icon: <Wifi size={15} /> },
                { val: user?.role ?? "—", label: "Account Role", icon: <User size={15} />, capitalize: true },
                { val: currentSession?.rememberMe ? "30 days" : "8 hours", label: "Session Length", icon: <Clock size={15} /> },
              ].map(k => (
                <div key={k.label} className="text-center px-5 py-3 rounded-xl border border-white/12"
                  style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-center gap-1 mb-1" style={{ color: "#fb923c" }}>{k.icon}</div>
                  <p className={`text-lg font-bold text-white ${k.capitalize ? "capitalize" : ""}`}>{k.val}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{k.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two-column content grid */}
        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 300px" }}>
          {/* ── Left column: Personal Info + Security + Sessions ── */}
          <div className="space-y-5">
            <CmdCard title="Personal Information" icon={<User size={15} />}>
              <form onSubmit={onSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Full Name"><Input {...profileForm.register("fullName")} placeholder="Your full name" /></FormField>
                  <FormField label="Username"><Input value={profile?.username ?? ""} disabled className="bg-muted/50" /></FormField>
                  <FormField label="Email"><Input type="email" {...profileForm.register("email")} /></FormField>
                  <FormField label="Mobile"><Input {...profileForm.register("mobile")} placeholder="+91 XXXXX XXXXX" /></FormField>
                </div>
                <FormField label="Address"><Input {...profileForm.register("address")} /></FormField>
                <FormField label="Bio"><Textarea {...profileForm.register("bio")} className="resize-none" rows={2} placeholder="Tell us about yourself..." /></FormField>
                <div className="flex justify-end"><Button type="submit" disabled={updateMut.isPending}>{updateMut.isPending ? "Saving…" : "Save Changes"}</Button></div>
              </form>
            </CmdCard>

            <CmdCard title="Security" icon={<Lock size={15} />}>
              <form onSubmit={onChangePassword} className="space-y-4">
                <FormField label="Current Password"><Input type="password" {...passwordForm.register("currentPassword")} placeholder="Enter current password" /></FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="New Password"><Input type="password" {...passwordForm.register("password")} /></FormField>
                  <FormField label="Confirm Password"><Input type="password" {...passwordForm.register("confirmPassword")} /></FormField>
                </div>
                <div className="flex justify-end"><Button type="submit" disabled={updateMut.isPending}>{updateMut.isPending ? "Changing…" : "Change Password"}</Button></div>
              </form>
            </CmdCard>

            <CmdCard title="Active Sessions" icon={<Wifi size={15} />}
              action={
                <Button variant="outline" size="sm" onClick={() => refetchSessions()} disabled={sessionsFetching} className="gap-1.5 h-7 text-xs">
                  <RefreshCw size={12} className={sessionsFetching ? "animate-spin" : ""} />Refresh
                </Button>
              }>
              {sessionsContent}
            </CmdCard>
          </div>

          {/* ── Right column: Preferences + Business (admin) + System (admin) ── */}
          <div className="space-y-5">
            <CmdCard title="Preferences" icon={<Palette size={15} />}>
              <form onSubmit={onSavePreferences} className="space-y-4">
                {[
                  { label: "Theme", icon: <Palette size={14} />, child: <Select value={prefsForm.watch("theme")} onValueChange={v => prefsForm.setValue("theme", v as "light"|"dark")}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">☀️ Light</SelectItem><SelectItem value="dark">🌙 Dark</SelectItem></SelectContent></Select> },
                  { label: "Language", icon: <Globe size={14} />, badge: <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">{currentLang.flag} {currentLang.name}</span>, child: <Select value={prefsForm.watch("language")} onValueChange={v => { prefsForm.setValue("language", v as "en"|"hi"|"or"); setLanguage(v); }}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">🇬🇧 English</SelectItem><SelectItem value="hi">🇮🇳 हिंदी</SelectItem><SelectItem value="or">🇮🇳 ଓଡ଼ිଆ</SelectItem></SelectContent></Select> },
                  { label: "Dashboard", icon: <LayoutDashboard size={14} />, child: <Select value={prefsForm.watch("dashboardLayout")} onValueChange={v => prefsForm.setValue("dashboardLayout", v)}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Default</SelectItem><SelectItem value="compact">Compact</SelectItem><SelectItem value="expanded">Expanded</SelectItem></SelectContent></Select> },
                ].map((row: any, i, arr) => (
                  <div key={row.label} className={`flex items-center justify-between ${i < arr.length - 1 ? "pb-4 border-b" : ""}`}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-medium">{row.icon}{row.label}</div>
                      {row.badge && <div>{row.badge}</div>}
                    </div>
                    {row.child}
                  </div>
                ))}
                <Button type="submit" className="w-full mt-1" disabled={updatePrefsMut.isPending}>{updatePrefsMut.isPending ? "Saving…" : "Save Preferences"}</Button>
              </form>
            </CmdCard>

            {isAdmin && (
              <CmdCard title="Business Information" icon={<Building2 size={15} />} adminOnly>
                <form onSubmit={onSaveSettings} className="space-y-3">
                  <FormField label="Business Name"><Input {...settingsForm.register("businessName")} /></FormField>
                  <FormField label="Website"><Input {...settingsForm.register("businessWebsite")} placeholder="e.g. sahucsc.in" /></FormField>
                  <FormField label="Mobile"><Input {...settingsForm.register("businessMobile")} /></FormField>
                  <FormField label="Email"><Input type="email" {...settingsForm.register("businessEmail")} /></FormField>
                  <FormField label="Address"><Input {...settingsForm.register("businessAddress")} /></FormField>
                  <Button type="submit" className="w-full mt-1" disabled={updateSettingsMut.isPending}>{updateSettingsMut.isPending ? "Saving…" : "Save Business Info"}</Button>
                </form>
              </CmdCard>
            )}

            {isAdmin && (
              <CmdCard title="System Settings" icon={<Settings2 size={15} />} adminOnly>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">User Registration</p>
                    <RegistrationControlSection />
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">System Preferences</p>
                    <form onSubmit={onSaveSettings} className="space-y-3">
                      <FormField label="Language">
                        <Select value={settingsForm.watch("language")} onValueChange={v => settingsForm.setValue("language", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="hi">Hindi</SelectItem><SelectItem value="or">Odia</SelectItem></SelectContent>
                        </Select>
                      </FormField>
                      <FormField label="Theme">
                        <Select value={settingsForm.watch("theme")} onValueChange={v => settingsForm.setValue("theme", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent>
                        </Select>
                      </FormField>
                      <FormField label="Currency">
                        <Select value={settingsForm.watch("currency")} onValueChange={v => settingsForm.setValue("currency", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="INR">INR (₹)</SelectItem><SelectItem value="USD">USD ($)</SelectItem></SelectContent>
                        </Select>
                      </FormField>
                      <div className="flex items-center justify-between pt-1">
                        <div><p className="text-sm font-medium">Auto Backup</p><p className="text-xs text-muted-foreground">Scheduled backups</p></div>
                        <Switch checked={settingsForm.watch("autoBackup")} onCheckedChange={v => settingsForm.setValue("autoBackup", v)} />
                      </div>
                      {settingsForm.watch("autoBackup") && (
                        <FormField label="Frequency (days)"><Input type="number" min={1} max={30} {...settingsForm.register("backupFrequencyDays", { valueAsNumber: true })} className="w-24" /></FormField>
                      )}
                      <Button type="submit" className="w-full" disabled={updateSettingsMut.isPending}>{updateSettingsMut.isPending ? "Saving…" : "Save Settings"}</Button>
                    </form>
                  </div>
                </div>
              </CmdCard>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE — V3: section list → drill-in (below md)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="md:hidden -mx-4">
        {mobileSection === null ? (
          <div>
            {/* Avatar summary */}
            <div className="flex flex-col items-center py-6 border-b bg-card/50">
              <div className="relative mb-3">
                <Avatar className="h-20 w-20 border-2 border-border">
                  {displayPicture ? <AvatarImage src={displayPicture} alt="Profile" className="object-cover" /> : null}
                  <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <button type="button" onClick={() => setShowPicker(true)} className="absolute -bottom-1 -right-1 rounded-full bg-orange-500 text-white p-1.5 shadow-md">
                  <Camera size={12} />
                </button>
              </div>
              <p className="font-bold text-lg">{profile?.fullName || profile?.username}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <Badge variant="outline" className="mt-1.5 text-xs capitalize">{profile?.role}</Badge>
            </div>
            {/* Nav rows */}
            <div className="px-4 pt-4 space-y-1.5">
              {MOBILE_NAV.filter(n => !n.adminOnly || isAdmin).map(item => (
                <button key={item.id} onClick={() => setMobileSection(item.id)}
                  className="flex items-center justify-between w-full p-4 rounded-xl border bg-card hover:bg-accent transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">{item.icon}</div>
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
          <div>
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b">
              <button onClick={() => setMobileSection(null)} className="flex items-center gap-1 text-primary text-sm font-medium hover:opacity-80">
                <ChevronRight size={16} className="rotate-180" />Back
              </button>
              <h2 className="text-base font-bold">{MOBILE_NAV.find(n => n.id === mobileSection)?.label}</h2>
            </div>
            <div className="px-4 pt-4 pb-8">
              {mobileSectionContent[mobileSection]}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// ─── SessionCard ─────────────────────────────────────────────────────────────
function SessionCard({ session, compact = false }: { session: SessionEntry; compact?: boolean }) {
  const DevIcon = deviceIcon(session.os);
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <DevIcon size={15} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-sm">{session.browser}</span>
          <span className="text-muted-foreground text-xs">on</span>
          <span className="text-sm">{session.os}</span>
          {session.isCurrent && <Badge variant="default" className="text-[9px] px-1.5 py-0">This Device</Badge>}
          {session.rememberMe && <Badge variant="outline" className="text-[9px] px-1.5 py-0">Remember Me</Badge>}
        </div>
        {!compact && (
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={10} />{session.ipAddress}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock size={10} />{timeAgo(session.lastActivity)}</span>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatExpiry(session.expiresAt)}</p>
      </div>
    </div>
  );
}
