import { useState, useRef, useEffect } from "react";
import { useGetProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar, getGetProfileQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { Camera, Trash2, User, Shield, Lock } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const { data: profile, isLoading } = useGetProfile();
  const updateMut = useUpdateProfile();
  const uploadAvatarMut = useUploadAvatar();
  const deleteAvatarMut = useDeleteAvatar();

  const profileForm = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      bio: "",
      address: "",
    }
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
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

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
  };

  const onSaveProfile = profileForm.handleSubmit(async (values) => {
    try {
      await updateMut.mutateAsync({ data: values as any });
      invalidate();
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
        data: {
          currentPassword: values.currentPassword,
          password: values.password,
        } as any
      });
      invalidate();
      passwordForm.reset();
      setShowPasswordSection(false);
      toast({ title: "Password changed successfully" });
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? "Failed to change password";
      toast({ title: msg, variant: "destructive" });
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast({ title: "Only JPG, PNG, or WEBP images allowed", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      try {
        await uploadAvatarMut.mutateAsync({ data: { profilePicture: dataUrl } });
        invalidate();
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
      invalidate();
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
          <p className="text-sm text-muted-foreground">Manage your personal information and account settings</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User size={16} /> Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-border">
                      {displayPicture ? (
                        <AvatarImage src={displayPicture} alt="Profile" className="object-cover" />
                      ) : null}
                      <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 rounded-full bg-primary text-primary-foreground p-1.5 shadow-md hover:bg-primary/90 transition-colors"
                    >
                      <Camera size={12} />
                    </button>
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-lg">{profile?.fullName || profile?.username}</p>
                      <Badge className={roleColors[profile?.role ?? "user"] ?? ""} variant="outline">
                        <Shield size={10} className="mr-1" />
                        {profile?.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadAvatarMut.isPending}
                      >
                        <Camera size={14} className="mr-1" />
                        {uploadAvatarMut.isPending ? "Uploading..." : "Change Photo"}
                      </Button>
                      {displayPicture && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={handleDeleteAvatar}
                          disabled={deleteAvatarMut.isPending}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WEBP — max 5MB</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-2 gap-4">
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
                    {updateMut.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock size={16} /> Security
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                  >
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
                      <Input
                        type="password"
                        {...passwordForm.register("currentPassword")}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>New Password</Label>
                        <Input
                          type="password"
                          {...passwordForm.register("password")}
                          placeholder="Min 6 characters"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Confirm Password</Label>
                        <Input
                          type="password"
                          {...passwordForm.register("confirmPassword")}
                          placeholder="Repeat new password"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={updateMut.isPending}>
                      {updateMut.isPending ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
                </CardContent>
              )}
              {!showPasswordSection && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                  </p>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
