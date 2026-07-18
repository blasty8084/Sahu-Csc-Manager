/**
 * ProfileDesktopLayout — desktop (md+) two-column grid for the Profile page.
 * Owns no state; receives everything via props from profile.tsx.
 */
import { Button } from "@/components/ui/button";
import {
  Lock, Palette, Building2, Settings2,
  Wifi, ShieldCheck, Smartphone, RefreshCw, User,
} from "lucide-react";
import { CmdCard } from "./ProfileCards";
import { ProfileDesktopBanner } from "./ProfileDesktopBanner";
import { ProfileInfoForm } from "./ProfileInfoForm";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { ProfileSessionsList } from "./ProfileSessionsList";
import { TwoFactorSection } from "./TwoFactorSection";
import { DevicesSection } from "./DevicesSection";
import { ProfilePreferencesForm } from "./ProfilePreferencesForm";
import { ProfileBusinessForm } from "./ProfileBusinessForm";
import { RegistrationControlSection } from "./RegistrationControlSection";
import { ProfileSystemSettings } from "./ProfileSystemSettings";

interface Props {
  // avatar / banner
  profile: any;
  displayPicture: string | null | undefined;
  initials: string;
  sessions: any[];
  currentSession: any;
  user: any;
  onShowPicker: () => void;
  onDeleteAvatar: () => void;
  uploadPending: boolean;
  deletePending: boolean;
  // sessions panel
  refetchSessions: () => void;
  sessionsFetching: boolean;
  sessionsProps: any;
  // forms
  profileForm: any;
  updateMut: { isPending: boolean };
  onSaveProfile: any;
  passwordForm: any;
  onChangePassword: any;
  prefsForm: any;
  updatePrefsMut: any;
  onSavePreferences: any;
  currentLang: { flag: string; name: string; script?: string };
  settingsForm: any;
  updateSettingsMut: any;
  onSaveSettings: any;
  isAdmin: boolean;
}

export function ProfileDesktopLayout({
  profile, displayPicture, initials, sessions, currentSession, user,
  onShowPicker, onDeleteAvatar, uploadPending, deletePending,
  refetchSessions, sessionsFetching, sessionsProps,
  profileForm, updateMut, onSaveProfile,
  passwordForm, onChangePassword,
  prefsForm, updatePrefsMut, onSavePreferences, currentLang,
  settingsForm, updateSettingsMut, onSaveSettings,
  isAdmin,
}: Props) {
  return (
    <>
      <ProfileDesktopBanner
        profile={profile} displayPicture={displayPicture} initials={initials}
        sessions={sessions} currentSession={currentSession} user={user}
        onShowPicker={onShowPicker} onDeleteAvatar={onDeleteAvatar}
        uploadPending={uploadPending} deletePending={deletePending}
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
          <CmdCard
            title="Active Sessions" icon={<Wifi size={15} />}
            action={
              <Button variant="outline" size="sm" onClick={refetchSessions} disabled={sessionsFetching} className="gap-1.5 h-7 text-xs">
                <RefreshCw size={12} className={sessionsFetching ? "animate-spin" : ""} />Refresh
              </Button>
            }
          >
            <ProfileSessionsList {...sessionsProps} />
          </CmdCard>
          <CmdCard title="Two-Factor Authentication" icon={<ShieldCheck size={15} />}>
            <TwoFactorSection />
          </CmdCard>
          <CmdCard title="Trusted Devices" icon={<Smartphone size={15} />}>
            <DevicesSection />
          </CmdCard>
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
    </>
  );
}
