import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { usePendingCount } from "@/hooks/use-pending-count";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePendingUsers, useAppealUsers } from "@/hooks/useUsers";
import { useForm } from "react-hook-form";
import { type UserForm, type Tab } from "@/components/users/users.constants";

export function useUsersPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const isMobile = useIsMobile();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>("pending");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkDismissLoading, setBulkDismissLoading] = useState(false);
  const [showBulkDismissConfirm, setShowBulkDismissConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "operator" | "user">("all");
  const [resetPwUser, setResetPwUser] = useState<any>(null);
  const [resetPwValue, setResetPwValue] = useState("");
  const [resetPwConfirm, setResetPwConfirm] = useState("");
  const [resetPwShow, setResetPwShow] = useState(false);
  const [resetPwLoading, setResetPwLoading] = useState(false);
  const [resetLinkUser, setResetLinkUser] = useState<any | null>(null);
  const [resetLinkToken, setResetLinkToken] = useState<string | null>(null);
  const [resetLinkExpiry, setResetLinkExpiry] = useState<string | null>(null);
  const [resetLinkLoading, setResetLinkLoading] = useState(false);
  const [resetLinkCopied, setResetLinkCopied] = useState(false);
  const [resetLinkEmailLoading, setResetLinkEmailLoading] = useState(false);
  const [resetLinkEmailSent, setResetLinkEmailSent] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: users, isLoading: usersLoading } = useListUsers();
  const { data: pendingUsers, isLoading: pendingLoading } = usePendingUsers();
  const { data: appealUsers, isLoading: appealLoading } = useAppealUsers();
  const { data: pendingCountData } = usePendingCount();

  const createMut = useCreateUser();
  const updateMut = useUpdateUser();
  const deleteMut = useDeleteUser();

  const form = useForm<UserForm>({
    defaultValues: { username: "", email: "", mobile: "", fullName: "", password: "", role: "operator", isActive: true },
  });

  // ── Computed ──────────────────────────────────────────────────────────────
  const resetLinkUrl = resetLinkToken
    ? `${window.location.origin}/forgot-password?token=${resetLinkToken}${resetLinkExpiry ? `&exp=${new Date(resetLinkExpiry).getTime()}` : ""}`
    : null;

  const pendingCount = pendingCountData?.count ?? pendingUsers?.length ?? 0;
  const appealCount  = appealUsers?.length ?? 0;
  const activeUsers  = (users ?? []).filter((u: any) => u.status === "ACTIVE" || u.isActive);

  const baseUsers =
    tab === "pending" ? (pendingUsers ?? []) :
    tab === "active"  ? activeUsers :
    tab === "appeals" ? (appealUsers ?? []) :
    (users ?? []);

  const searchLower    = searchQuery.toLowerCase().trim();
  const displayedUsers = baseUsers.filter((u: any) => {
    const matchesSearch =
      !searchLower ||
      (u.fullName ?? "").toLowerCase().includes(searchLower) ||
      (u.username  ?? "").toLowerCase().includes(searchLower) ||
      (u.email     ?? "").toLowerCase().includes(searchLower);
    return matchesSearch && (roleFilter === "all" || u.role === roleFilter);
  });
  const isLoading = tab === "pending" ? pendingLoading : tab === "appeals" ? appealLoading : usersLoading;

  return {
    // Context (needed by useUserActions)
    toast, qc, isMobile,
    // State
    tab, setTab,
    showForm, setShowForm, editUser, setEditUser,
    showPassword, setShowPassword,
    deleteId, setDeleteId,
    rejectTarget, setRejectTarget, rejectReason, setRejectReason,
    actionLoading, setActionLoading,
    selectedIds, setSelectedIds,
    showBulkRejectDialog, setShowBulkRejectDialog,
    bulkRejectReason, setBulkRejectReason,
    bulkActionLoading, setBulkActionLoading,
    bulkDismissLoading, setBulkDismissLoading,
    showBulkDismissConfirm, setShowBulkDismissConfirm,
    searchQuery, setSearchQuery, roleFilter, setRoleFilter,
    resetPwUser, setResetPwUser,
    resetPwValue, setResetPwValue, resetPwConfirm, setResetPwConfirm,
    resetPwShow, setResetPwShow, resetPwLoading, setResetPwLoading,
    resetLinkUser, setResetLinkUser,
    resetLinkToken, setResetLinkToken, resetLinkExpiry, setResetLinkExpiry,
    resetLinkLoading, setResetLinkLoading,
    resetLinkCopied, setResetLinkCopied,
    resetLinkEmailLoading, setResetLinkEmailLoading,
    resetLinkEmailSent, setResetLinkEmailSent,
    // Data
    users, pendingUsers, appealUsers,
    usersLoading, pendingLoading, appealLoading,
    createMut, updateMut, deleteMut, form,
    // Computed
    resetLinkUrl,
    pendingCount, appealCount,
    activeUsers, displayedUsers, searchLower, isLoading,
  };
}

export type UsersPageState = ReturnType<typeof useUsersPage>;
