/**
 * ProfileMobileLayout — full mobile section of the Profile page.
 * Owns its own drill-in navigation state so profile.tsx stays thin.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Lock, Palette, Building2, Settings2,
  User, ChevronRight, RefreshCw,
} from "lucide-react";
import { ProfileAvatarCard, ProfileAvatarSummary } from "./ProfileAvatarUpload";
import { ProfileInfoForm } from "./ProfileInfoForm";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { ProfileSessionsList } from "./ProfileSessionsList";
import { TwoFactorSection } from "./TwoFactorSection";
import { DevicesSection } from "./DevicesSection";
import { ProfilePreferencesForm } from "./ProfilePreferencesForm";
import { ProfileBusinessForm } from "./ProfileBusinessForm";
import { RegistrationControlSection } from "./RegistrationControlSection";
import { ProfileSystemSettings } from "./ProfileSystemSettings";

// ─── Nav config ───────────────────────────────────────────────────────────────
type MobileTab = "profile" | "security" | "preferences" | "business" | "system";
interface MobileNavItem { id: MobileTab; label: string; icon: React.ReactNode; adminOnly?: boolean; }
const MOBILE_NAV: MobileNavItem[] = [
  { id: "profile",     label: "My Profile",    icon: <User size={16} /> },
  { id: "security",    label: "Security",       icon: <Lock size={16} /> },
  { id: "preferences", label: "Preferences",   icon: <Palette size={16} /> },
  { id: "business",    label: "Business Info",  icon: <Building2 size={16} />, adminOnly: true },
  { id: "system",      label: "System",         icon: <Settings2 size={16} />, adminOnly: true },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  profile: any;
  displayPicture: string | null | undefined;
  initials: string;
  onShowPicker: () => void;
  onDeleteAvatar: () => void;
  uploadPending: boolean;
  deletePending: boolean;
  isAdmin: boolean;
  refetchSessions: () => void;
  sessionsFetching: boolean;
  sessionsProps: any;
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
}

export function ProfileMobileLayout({
  profile, displayPicture, initials, onShowPicker, onDeleteAvatar, uploadPending, deletePending,
  isAdmin, refetchSessions, sessionsFetching, sessionsProps,
  profileForm, updateMut, onSaveProfile,
  passwordForm, onChangePassword,
  prefsForm, updatePrefsMut, onSavePreferences, currentLang,
  settingsForm, updateSettingsMut, onSaveSettings,
}: Props) {
  const [mobileSection, setMobileSection] = useState<MobileTab | null>(null);

  // ─── Drill-in content per section ─────────────────────────────────────────
  const sectionContent: Record<MobileTab, React.ReactNode> = {
    profile: (
      <div className="space-y-4">
        <ProfileAvatarCard
          profile={profile} displayPicture={displayPicture} initials={initials}
          onShowPicker={onShowPicker} onDeleteAvatar={onDeleteAvatar}
          uploadPending={uploadPending} deletePending={deletePending}
        />
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
            <Button variant="ghost" size="sm" onClick={refetchSessions} disabled={sessionsFetching} className="gap-1 h-7 text-xs">
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

  // ─── Top-level nav list ───────────────────────────────────────────────────
  if (mobileSection === null) {
    return (
      <div>
        <div className="flex flex-col items-center py-6 border-b bg-card/50">
          <ProfileAvatarSummary profile={profile} displayPicture={displayPicture} initials={initials} onShowPicker={onShowPicker} />
        </div>
        <div className="px-4 pt-4 space-y-1.5">
          {MOBILE_NAV.filter(n => !n.adminOnly || isAdmin).map(item => (
            <button
              key={item.id}
              onClick={() => setMobileSection(item.id)}
              className="flex items-center justify-between w-full p-4 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
            >
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
    );
  }

  // ─── Drill-in view ────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b">
        <button onClick={() => setMobileSection(null)} className="flex items-center gap-1 text-primary text-sm font-medium hover:opacity-80">
          <ChevronRight size={16} className="rotate-180" />Back
        </button>
        <h2 className="text-base font-bold">{MOBILE_NAV.find(n => n.id === mobileSection)?.label}</h2>
      </div>
      <div className="px-4 pt-4 pb-8">{sectionContent[mobileSection]}</div>
    </div>
  );
}
