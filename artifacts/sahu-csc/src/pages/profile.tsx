import { Layout } from "@/components/layout";
import { ProfilePageSkeleton } from "@/components/skeletons";
import { useAuth } from "@/hooks/use-auth";
import { useProfileData } from "@/components/profile/useProfileData";
import { MediaPickerDialog } from "@/components/profile/MediaPickerDialog";
import { ProfileSessionDialogs } from "@/components/profile/ProfileSessionDialogs";
import { ProfileDesktopLayout } from "@/components/profile/ProfileDesktopLayout";
import { ProfileMobileLayout } from "@/components/profile/ProfileMobileLayout";

export default function Profile() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

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

  const sessionsProps = {
    sessions, sessionsLoading, currentSession, otherSessions, user,
    revokeMut, revokeOthersMut, revokeAllMut,
    setRevokeId, setRevokeOthersOpen, setRevokeAllOpen,
  };

  const avatarProps = {
    profile, displayPicture, initials,
    onShowPicker: () => setShowPicker(true),
    onDeleteAvatar: handleDeleteAvatar,
    uploadPending: uploadAvatarMut.isPending,
    deletePending: deleteAvatarMut.isPending,
  };

  const formProps = {
    profileForm, updateMut, onSaveProfile,
    passwordForm, onChangePassword,
    prefsForm, updatePrefsMut, onSavePreferences, currentLang,
    settingsForm, updateSettingsMut, onSaveSettings,
  };

  return (
    <Layout>
      <MediaPickerDialog open={showPicker} onClose={() => setShowPicker(false)} onFileSelected={handleFileSelected} />

      <ProfileSessionDialogs
        revokeId={revokeId} setRevokeId={setRevokeId} revokeMut={revokeMut}
        revokeOthersOpen={revokeOthersOpen} setRevokeOthersOpen={setRevokeOthersOpen}
        revokeOthersMut={revokeOthersMut} otherSessions={otherSessions}
        revokeAllOpen={revokeAllOpen} setRevokeAllOpen={setRevokeAllOpen}
        revokeAllMut={revokeAllMut} sessions={sessions}
      />

      {/* Desktop (md+) */}
      <div className="hidden md:block">
        <ProfileDesktopLayout
          {...avatarProps} {...formProps}
          sessions={sessions} currentSession={currentSession} user={user}
          refetchSessions={refetchSessions} sessionsFetching={sessionsFetching}
          sessionsProps={sessionsProps} isAdmin={isAdmin}
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden -mx-4">
        <ProfileMobileLayout
          {...avatarProps} {...formProps}
          isAdmin={isAdmin}
          refetchSessions={refetchSessions} sessionsFetching={sessionsFetching}
          sessionsProps={sessionsProps}
        />
      </div>
    </Layout>
  );
}
