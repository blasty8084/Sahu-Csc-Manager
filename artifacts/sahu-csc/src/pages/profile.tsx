import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ProfilePageSkeleton } from "@/components/skeletons";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  Lock, Palette, Building2, Settings2, ChevronRight,
  Wifi, ShieldCheck, Smartphone, RefreshCw, User,
} from "lucide-react";

import { useProfileData } from "@/components/profile/useProfileData";
import { MediaPickerDialog } from "@/components/profile/MediaPickerDialog";
import { CmdCard } from "@/components/profile/ProfileCards";
import { ProfileInfoForm } from "@/components/profile/ProfileInfoForm";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";
import { TwoFactorSection } from "@/components/profile/TwoFactorSection";
import { DevicesSection } from "@/components/profile/DevicesSection";
import { RegistrationControlSection } from "@/components/profile/RegistrationControlSection";
import { ProfileDesktopBanner } from "@/components/profile/ProfileDesktopBanner";
import { ProfileAvatarCard, ProfileAvatarSummary } from "@/components/profile/ProfileAvatarUpload";
import { ProfileSessionsList } from "@/components/profile/ProfileSessionsList";
import { ProfilePreferencesForm } from "@/components/profile/ProfilePreferencesForm";
import { ProfileBusinessForm } from "@/components/profile/ProfileBusinessForm";
import { ProfileSystemSettings } from "@/components/profile/ProfileSystemSettings";

// ─── Mobile nav config ────────────────────────────────────────────────────────
type MobileTab = "profile" | "security" | "preferences" | "business" | "system";
interface MobileNavItem { id: MobileTab; label: string; icon: React.ReactNode; adminOnly?: boolean; }
const MOBILE_NAV: MobileNavItem[] = [
  { id: "profile",     label: "My Profile",   icon: <User size={16} /> },
  { id: "security",    label: "Security",      icon: <Lock size={16} /> },
  { id: "preferences", label: "Preferences",  icon: <Palette size={16} /> },
  { id: "business",    label: "Business Info", icon: <Building2 size={16} />, adminOnly: true },
  { id: "system",      label: "System",        icon: <Settings2 size={16} />, adminOnly: true },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [mobileSection, setMobileSection] = useState<MobileTab | null>(null);

  const {
    profile, profileLoading, sessions, sessionsLoading, sessionsFetching,
    refetchSessions, currentSession, otherSessions, displayPicture, initials,
    updateMut, uploadAvatarMut, deleteAvatarMut, updatePrefsMut, updateSettingsMut,
    revokeMut, revokeOthersMut, revokeAllMut,
    profileForm, passwordForm, prefsForm, currentLang, settingsForm,
    onSaveProfile, onChangePassword, onSavePreferences, onSaveSettings,
    handleFileSelected, handleDeleteAvatar,
    showPicker, setShowPicker, revokeId, setRevokeId,
    revokeOthersOpen, setRevokeOthersOpen, revokeAllOpen, setRevokeAllOpen,
  } = useProfileData();

  if (profileLoading && !profile) return <Layout><ProfilePageSkeleton /></Layout>;

  // shared props threaded into sessions components
  const sessionsProps = {
    sessions, sessionsLoading, currentSession, otherSessions, user,
    revokeMut, revokeOthersMut, revokeAllMut,
    setRevokeId, setRevokeOthersOpen, setRevokeAllOpen,
  };

  // mobile drill-in content per section
  const mobileSectionContent: Record<MobileTab, React.ReactNode> = {
    profile: (
      <div className="space-y-4">
        <ProfileAvatarCard profile={profile} displayPicture={displayPicture} initials={initials}
          onShowPicker={() => setShowPicker(true)} onDeleteAvatar={handleDeleteAvatar}
          uploadPending={uploadAvatarMut.isPending} deletePending={deleteAvatarMut.isPending} />
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Personal Information</p>
          <ProfileInfoForm form={profileForm} username={profile?.username} isPending={updateMut.isPending} onSubmit={onSaveProfile} layout="mobile" />
        </div>
      </div>
    ),
    security: (
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Change Password</p>
          <PasswordChangeForm form={passwordForm} isPending={updateMut.isPending} onSubmit={onChangePassword} layout="mobile" />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sessions</p>
            <Button variant="ghost" size="sm" onClick={() => refetchSessions()} disabled={sessionsFetching} className="gap-1 h-7 text-xs">
              <RefreshCw size={12} className={sessionsFetching ? "animate-spin" : ""} />Refresh
            </Button>
          </div>
          <ProfileSessionsList {...sessionsProps} compact />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Two-Factor Authentication</p>
          <TwoFactorSection />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Trusted Devices</p>
          <DevicesSection />
        </div>
      </div>
    ),
    preferences: (
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Preferences</p>
        <ProfilePreferencesForm prefsForm={prefsForm} updatePrefsMut={updatePrefsMut} onSavePreferences={onSavePreferences} currentLang={currentLang} />
      </div>
    ),
    business: (
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Business Information</p>
        <ProfileBusinessForm settingsForm={settingsForm} updateSettingsMut={updateSettingsMut} onSaveSettings={onSaveSettings} />
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
          <ProfileSystemSettings settingsForm={settingsForm} updateSettingsMut={updateSettingsMut} onSaveSettings={onSaveSettings} />
        </div>
      </div>
    ),
  };

  return (
    <Layout>
      <MediaPickerDialog open={showPicker} onClose={() => setShowPicker(false)} onFileSelected={handleFileSelected} />

      {/* ─── Session confirm dialogs ─────────────────────────────────────── */}
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

      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP (md+)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        <ProfileDesktopBanner
          profile={profile} displayPicture={displayPicture} initials={initials}
          sessions={sessions} currentSession={currentSession} user={user}
          onShowPicker={() => setShowPicker(true)} onDeleteAvatar={handleDeleteAvatar}
          uploadPending={uploadAvatarMut.isPending} deletePending={deleteAvatarMut.isPending}
        />

        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 300px" }}>
          {/* Left column */}
          <div className="space-y-5">
            <CmdCard title="Personal Information" icon={<User size={15} />}>
              <ProfileInfoForm form={profileForm} username={profile?.username} isPending={updateMut.isPending} onSubmit={onSaveProfile} layout="desktop" />
            </CmdCard>
            <CmdCard title="Security" icon={<Lock size={15} />}>
              <PasswordChangeForm form={passwordForm} isPending={updateMut.isPending} onSubmit={onChangePassword} layout="desktop" />
            </CmdCard>
            <CmdCard title="Active Sessions" icon={<Wifi size={15} />}
              action={<Button variant="outline" size="sm" onClick={() => refetchSessions()} disabled={sessionsFetching} className="gap-1.5 h-7 text-xs"><RefreshCw size={12} className={sessionsFetching ? "animate-spin" : ""} />Refresh</Button>}>
              <ProfileSessionsList {...sessionsProps} />
            </CmdCard>
            <CmdCard title="Two-Factor Authentication" icon={<ShieldCheck size={15} />}><TwoFactorSection /></CmdCard>
            <CmdCard title="Trusted Devices" icon={<Smartphone size={15} />}><DevicesSection /></CmdCard>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <CmdCard title="Preferences" icon={<Palette size={15} />}>
              <ProfilePreferencesForm prefsForm={prefsForm} updatePrefsMut={updatePrefsMut} onSavePreferences={onSavePreferences} currentLang={currentLang} />
            </CmdCard>
            {isAdmin && (
              <CmdCard title="Business Information" icon={<Building2 size={15} />} adminOnly>
                <ProfileBusinessForm settingsForm={settingsForm} updateSettingsMut={updateSettingsMut} onSaveSettings={onSaveSettings} />
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
                    <ProfileSystemSettings settingsForm={settingsForm} updateSettingsMut={updateSettingsMut} onSaveSettings={onSaveSettings} />
                  </div>
                </div>
              </CmdCard>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE (below md)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden -mx-4">
        {mobileSection === null ? (
          <div>
            <div className="flex flex-col items-center py-6 border-b bg-card/50">
              <ProfileAvatarSummary profile={profile} displayPicture={displayPicture} initials={initials} onShowPicker={() => setShowPicker(true)} />
            </div>
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
            <div className="px-4 pt-4 pb-8">{mobileSectionContent[mobileSection]}</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
