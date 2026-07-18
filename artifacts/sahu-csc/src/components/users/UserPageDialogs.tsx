import type { UsersPageState } from "@/hooks/useUsersPage";
import type { UserActions }    from "@/hooks/useUserActions";
import { UserFormDialog }      from "./UserFormDialog";
import { DeleteUserDialog }    from "./DeleteUserDialog";
import { RejectUserDialog }    from "./RejectUserDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { ResetLinkDialog }     from "./ResetLinkDialog";
import { BulkRejectDialog }    from "./BulkRejectDialog";

interface UserPageDialogsProps {
  s: UsersPageState;
  a: UserActions;
}

/** Renders all six user-management dialogs in a single component. */
export function UserPageDialogs({ s, a }: UserPageDialogsProps) {
  return (
    <>
      <UserFormDialog
        showForm={s.showForm}
        setShowForm={s.setShowForm}
        isMobile={s.isMobile}
        editUser={s.editUser}
        form={s.form}
        onSubmit={a.onSubmit}
        saving={s.createMut.isPending || s.updateMut.isPending}
        showPassword={s.showPassword}
        setShowPassword={s.setShowPassword}
      />

      <DeleteUserDialog
        deleteId={s.deleteId}
        setDeleteId={s.setDeleteId}
        confirmDelete={a.confirmDelete}
        isPending={s.deleteMut.isPending}
      />

      <RejectUserDialog
        rejectTarget={s.rejectTarget}
        setRejectTarget={s.setRejectTarget}
        rejectReason={s.rejectReason}
        setRejectReason={s.setRejectReason}
        confirmReject={a.confirmReject}
        actionLoading={s.actionLoading}
      />

      <ResetPasswordDialog
        resetPwUser={s.resetPwUser}
        setResetPwUser={s.setResetPwUser}
        resetPwValue={s.resetPwValue}
        setResetPwValue={s.setResetPwValue}
        resetPwConfirm={s.resetPwConfirm}
        setResetPwConfirm={s.setResetPwConfirm}
        resetPwShow={s.resetPwShow}
        setResetPwShow={s.setResetPwShow}
        resetPwLoading={s.resetPwLoading}
        resetPassword={a.resetPassword}
      />

      <ResetLinkDialog
        resetLinkUser={s.resetLinkUser}
        closeResetLink={a.closeResetLink}
        resetLinkToken={s.resetLinkToken}
        resetLinkExpiry={s.resetLinkExpiry}
        resetLinkUrl={s.resetLinkUrl}
        resetLinkLoading={s.resetLinkLoading}
        resetLinkCopied={s.resetLinkCopied}
        resetLinkEmailLoading={s.resetLinkEmailLoading}
        resetLinkEmailSent={s.resetLinkEmailSent}
        generateResetLink={a.generateResetLink}
        copyResetLink={a.copyResetLink}
        sendResetLinkEmail={a.sendResetLinkEmail}
      />

      <BulkRejectDialog
        showBulkRejectDialog={s.showBulkRejectDialog}
        setShowBulkRejectDialog={s.setShowBulkRejectDialog}
        bulkRejectReason={s.bulkRejectReason}
        setBulkRejectReason={s.setBulkRejectReason}
        confirmBulkReject={a.confirmBulkReject}
        bulkActionLoading={s.bulkActionLoading}
        selectedCount={s.selectedIds.size}
      />
    </>
  );
}

export default UserPageDialogs;
