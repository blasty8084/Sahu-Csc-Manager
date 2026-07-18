/**
 * useProfileData — centralises all data fetching, mutations, forms, effects and
 * handlers for the Profile page. The page itself only owns UI state (mobile
 * drill-in section) and delegates everything else here.
 */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useGetProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar,
  getGetProfileQueryKey, getGetMeQueryKey,
  useGetPreferences, useUpdatePreferences, getGetPreferencesQueryKey,
  useGetSettings, useUpdateSettings, getGetSettingsQueryKey,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { useForm } from "react-hook-form";
import { setLanguage } from "@/lib/i18n";
import { apiFetch, LANG_META } from "./utils";
import type { SessionEntry } from "./types";

export function useProfileData() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const { setTheme } = useTheme();
  const qc = useQueryClient();

  // ── UI state (dialogs, avatar preview) ─────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [revokeId, setRevokeId] = useState<number | null>(null);
  const [revokeOthersOpen, setRevokeOthersOpen] = useState(false);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  // ── Queries ─────────────────────────────────────────────────────────────
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: prefs } = useGetPreferences();
  const { data: settings } = useGetSettings();
  const {
    data: sessions = [], isLoading: sessionsLoading,
    refetch: refetchSessions, isFetching: sessionsFetching,
  } = useQuery<SessionEntry[]>({
    queryKey: ["sessions"],
    queryFn: () => apiFetch("/sessions"),
    refetchInterval: 30_000,
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const updateMut          = useUpdateProfile();
  const updatePrefsMut     = useUpdatePreferences();
  const updateSettingsMut  = useUpdateSettings();
  const uploadAvatarMut    = useUploadAvatar();
  const deleteAvatarMut    = useDeleteAvatar();

  const revokeMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/sessions/${id}`, { method: "DELETE" }),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session revoked");
      if (data?.redirect) logout();
    },
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

  // ── Forms ────────────────────────────────────────────────────────────────
  const profileForm = useForm({ defaultValues: { fullName: "", email: "", mobile: "", bio: "", address: "" } });
  const passwordForm = useForm({ defaultValues: { currentPassword: "", password: "", confirmPassword: "" } });
  const prefsForm = useForm({ defaultValues: { theme: "light" as "light" | "dark", language: "en" as "en" | "hi" | "or", dashboardLayout: "default" } });
  const currentLang = LANG_META[prefsForm.watch("language")] ?? LANG_META["en"];
  const settingsForm = useForm({
    defaultValues: {
      businessName: "", businessAddress: "", businessMobile: "",
      businessEmail: "", businessWebsite: "",
      language: "en", theme: "light", currency: "INR",
      autoBackup: false, backupFrequencyDays: 7,
    },
  });

  // ── Effects — sync server data into forms ────────────────────────────────
  useEffect(() => {
    if (profile) profileForm.reset({ fullName: profile.fullName ?? "", email: profile.email, mobile: profile.mobile ?? "", bio: profile.bio ?? "", address: profile.address ?? "" });
  }, [profile]);
  useEffect(() => {
    if (prefs) { prefsForm.reset({ theme: prefs.theme, language: prefs.language, dashboardLayout: prefs.dashboardLayout }); if (prefs.language) setLanguage(prefs.language); }
  }, [prefs]);
  useEffect(() => {
    if (settings) settingsForm.reset({
      businessName: settings.businessName, businessAddress: settings.businessAddress,
      businessMobile: settings.businessMobile, businessEmail: settings.businessEmail ?? "",
      businessWebsite: (settings as any).businessWebsite ?? "",
      language: settings.language, theme: settings.theme, currency: settings.currency,
      autoBackup: settings.autoBackup, backupFrequencyDays: settings.backupFrequencyDays,
    });
  }, [settings]);

  const invalidateProfile = () => {
    qc.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
  };

  // ── Submit handlers ──────────────────────────────────────────────────────
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
    try { await updateSettingsMut.mutateAsync({ data: v as any }); qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() }); setTheme(v.theme as "light" | "dark"); toast.success("Settings saved"); }
    catch { toast({ title: "Failed to save settings", variant: "destructive" }); }
  });

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      try { await uploadAvatarMut.mutateAsync({ data: { profilePicture: dataUrl } }); invalidateProfile(); toast.success("Profile picture updated"); }
      catch { setAvatarPreview(null); toast({ title: "Failed to upload picture", variant: "destructive" }); }
    };
    reader.readAsDataURL(file);
  };
  const handleDeleteAvatar = async () => {
    try { await deleteAvatarMut.mutateAsync(); setAvatarPreview(null); invalidateProfile(); toast.success("Profile picture removed"); }
    catch { toast({ title: "Failed to remove picture", variant: "destructive" }); }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const displayPicture  = avatarPreview || profile?.profilePicture;
  const initials        = (profile?.fullName || profile?.username || "U").charAt(0).toUpperCase();
  const currentSession  = sessions.find(s => s.isCurrent);
  const otherSessions   = sessions.filter(s => !s.isCurrent);

  return {
    // queries
    profile, profileLoading,
    sessions, sessionsLoading, refetchSessions, sessionsFetching,
    // mutations
    updateMut, updatePrefsMut, updateSettingsMut,
    uploadAvatarMut, deleteAvatarMut,
    revokeMut, revokeOthersMut, revokeAllMut,
    // forms
    profileForm, passwordForm, prefsForm, currentLang, settingsForm,
    // handlers
    onSaveProfile, onChangePassword, onSavePreferences, onSaveSettings,
    handleFileSelected, handleDeleteAvatar,
    // dialog state
    showPicker, setShowPicker,
    revokeId,        setRevokeId,
    revokeOthersOpen, setRevokeOthersOpen,
    revokeAllOpen,   setRevokeAllOpen,
    // derived
    displayPicture, initials, currentSession, otherSessions,
  };
}
