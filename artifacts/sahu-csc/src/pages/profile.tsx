import { useState, useRef, useEffect } from "react";
import { useGetProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar, getGetProfileQueryKey, getGetMeQueryKey, useGetPreferences, useUpdatePreferences, getGetPreferencesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { useForm } from "react-hook-form";
import { Camera, Trash2, User, Shield, Lock, Palette, Globe, LayoutDashboard, Image, FolderOpen, AlertCircle } from "lucide-react";

// ─── Media source picker dialog ───────────────────────────────────────────────
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

  const validate = (file: File): boolean => {
    const okTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!okTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
      toast({ title: "Unsupported format", description: "Please choose a JPG, PNG, WEBP or HEIC image.", variant: "destructive" });
      return false;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast({ title: "File too large", description: `Please choose an image under ${MAX_MB} MB.`, variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!validate(file)) return;
    onFileSelected(file);
    onClose();
  };

  const pickCamera = () => {
    onClose();
    // Small delay so dialog closes before camera opens (mobile UX)
    setTimeout(() => cameraInputRef.current?.click(), 80);
  };

  const pickGallery = () => {
    onClose();
    setTimeout(() => galleryInputRef.current?.click(), 80);
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept={ACCEPTED}
        capture="user"
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={handleChange}
      />

      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 pt-1">
            {/* Camera option */}
            <button
              type="button"
              onClick={pickCamera}
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-accent hover:border-primary/40 transition-colors text-left group"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Camera size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Take a Photo</p>
                <p className="text-xs text-muted-foreground">Open camera to take a new photo</p>
              </div>
            </button>

            {/* Gallery / file manager option */}
            <button
              type="button"
              onClick={pickGallery}
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-accent hover:border-primary/40 transition-colors text-left group"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <FolderOpen size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Choose from Gallery</p>
                <p className="text-xs text-muted-foreground">Browse photos and files on this device</p>
              </div>
            </button>
          </div>

          <div className="flex items-start gap-2 mt-1 p-3 rounded-lg bg-muted/50">
            <AlertCircle size={13} className="text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              JPG, PNG, WEBP or HEIC · max {MAX_MB} MB · Your photo is stored securely on this device's server.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Profile page ─────────────────────────────────────────────────────────────
export default function Profile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const qc = useQueryClient();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: prefs, isLoading: prefsLoading } = useGetPreferences();
  const updateMut = useUpdateProfile();
  const updatePrefsMut = useUpdatePreferences();
  const uploadAvatarMut = useUploadAvatar();
  const deleteAvatarMut = useDeleteAvatar();

  const isLoading = profileLoading || prefsLoading;

  const profileForm = useForm({
    defaultValues: { fullName: "", email: "", mobile: "", bio: "", address: "" }
  });

  const passwordForm = useForm({
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" }
  });

  const prefsForm = useForm({
    defaultValues: {
      theme: "light" as "light" | "dark",
      language: "en" as "en" | "hi" | "or",
      dashboardLayout: "default",
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
      prefsForm.reset({
        theme: prefs.theme,
        language: prefs.language,
        dashboardLayout: prefs.dashboardLayout,
      });
    }
  }, [prefs]);

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
      await updateMut.mutateAsync({
        data: { currentPassword: values.currentPassword, password: values.password } as any
      });
      invalidateProfile();
      passwordForm.reset();
      setShowPasswordSection(false);
      toast({ title: "Password changed successfully" });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? "Failed to change password";
      toast({ title: msg, variant: "destructive" });
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

  // Called by MediaPickerDialog once a valid file is chosen
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
  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    operator: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    user: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-xl font-bold">My Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your personal information, account settings, and preferences</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Profile Picture ── */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Image size={16} /> Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  {/* Avatar with camera overlay */}
                  <div className="relative shrink-0">
                    <Avatar className="h-24 w-24 border-2 border-border">
                      {displayPicture
                        ? <AvatarImage src={displayPicture} alt="Profile" className="object-cover" />
                        : null}
                      <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => setShowPicker(true)}
                      className="absolute -bottom-1 -right-1 rounded-full bg-primary text-primary-foreground p-1.5 shadow-md hover:bg-primary/90 transition-colors"
                      title="Change profile picture"
                    >
                      <Camera size={12} />
                    </button>
                  </div>

                  {/* Info + buttons */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-lg truncate">{profile?.fullName || profile?.username}</p>
                      <Badge className={roleColors[profile?.role ?? "user"] ?? ""} variant="outline">
                        <Shield size={10} className="mr-1" />
                        {profile?.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowPicker(true)}
                        disabled={uploadAvatarMut.isPending}
                        className="gap-1.5"
                      >
                        <Camera size={13} />
                        {uploadAvatarMut.isPending ? "Uploading…" : "Change Photo"}
                      </Button>
                      {displayPicture && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 gap-1.5"
                          onClick={handleDeleteAvatar}
                          disabled={deleteAvatarMut.isPending}
                        >
                          <Trash2 size={13} />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG · PNG · WEBP · HEIC — max 5 MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Media picker dialog ── */}
            <MediaPickerDialog
              open={showPicker}
              onClose={() => setShowPicker(false)}
              onFileSelected={handleFileSelected}
            />

            {/* ── Personal Information ── */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User size={16} /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Full Name</Label>
                      <Input {...profileForm.register("fullName")} placeholder="Your full name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Username</Label>
                      <Input value={profile?.username ?? ""} disabled className="bg-muted/50" />
                      <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input type="email" {...profileForm.register("email")} placeholder="your@email.com" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Mobile</Label>
                      <Input {...profileForm.register("mobile")} placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Address</Label>
                    <Input {...profileForm.register("address")} placeholder="Your address" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Bio</Label>
                    <Textarea
                      {...profileForm.register("bio")}
                      placeholder="Tell us about yourself..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={updateMut.isPending}>
                    {updateMut.isPending ? "Saving…" : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* ── Security ── */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock size={16} /> Security
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowPasswordSection(!showPasswordSection)}>
                    {showPasswordSection ? "Cancel" : "Change Password"}
                  </Button>
                </div>
              </CardHeader>
              {showPasswordSection && (
                <CardContent>
                  <Separator className="mb-4" />
                  <form onSubmit={onChangePassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Current Password</Label>
                      <Input type="password" {...passwordForm.register("currentPassword")} placeholder="Enter current password" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>New Password</Label>
                        <Input type="password" {...passwordForm.register("password")} placeholder="Min 6 characters" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Confirm Password</Label>
                        <Input type="password" {...passwordForm.register("confirmPassword")} placeholder="Repeat new password" />
                      </div>
                    </div>
                    <Button type="submit" disabled={updateMut.isPending}>
                      {updateMut.isPending ? "Changing…" : "Change Password"}
                    </Button>
                  </form>
                </CardContent>
              )}
              {!showPasswordSection && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Member since {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
                      : "—"}
                  </p>
                </CardContent>
              )}
            </Card>

            {/* ── Preferences ── */}
            <div>
              <h3 className="text-base font-semibold mb-4">Preferences</h3>
              <form onSubmit={onSavePreferences} className="space-y-4">
                {/* Appearance */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Palette size={16} /> Appearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Theme</Label>
                        <p className="text-xs text-muted-foreground">Choose your preferred colour scheme</p>
                      </div>
                      <Select
                        value={prefsForm.watch("theme")}
                        onValueChange={(v) => prefsForm.setValue("theme", v as "light" | "dark")}
                      >
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">☀️ Light</SelectItem>
                          <SelectItem value="dark">🌙 Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Language */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe size={16} /> Language
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Interface Language</Label>
                        <p className="text-xs text-muted-foreground">Select your preferred display language</p>
                      </div>
                      <Select
                        value={prefsForm.watch("language")}
                        onValueChange={(v) => prefsForm.setValue("language", v as "en" | "hi" | "or")}
                      >
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">🇬🇧 English</SelectItem>
                          <SelectItem value="hi">🇮🇳 हिंदी</SelectItem>
                          <SelectItem value="or">🇮🇳 ଓଡ଼ିଆ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Dashboard Layout */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <LayoutDashboard size={16} /> Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Layout</Label>
                        <p className="text-xs text-muted-foreground">Choose how your dashboard is arranged</p>
                      </div>
                      <Select
                        value={prefsForm.watch("dashboardLayout")}
                        onValueChange={(v) => prefsForm.setValue("dashboardLayout", v)}
                      >
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="expanded">Expanded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" disabled={updatePrefsMut.isPending}>
                  {updatePrefsMut.isPending ? "Saving…" : "Save Preferences"}
                </Button>
              </form>
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
}
