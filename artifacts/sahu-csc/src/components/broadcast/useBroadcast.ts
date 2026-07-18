import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useInvalidateNotifications } from "@/hooks/use-notifications";
import { BASE, BroadcastStats, HistoryResponse, Tab } from "./broadcastTypes";

export function useBroadcast() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const invalidateNotifications = useInvalidateNotifications();

  const [tab, setTab] = useState<Tab>("push");

  // Push tab state
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushUrl, setPushUrl] = useState("");
  const [createInAppWithPush, setCreateInAppWithPush] = useState(true);

  // Email tab state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [recipientFilter, setRecipientFilter] = useState<"all" | "active">("all");
  const [createInAppWithEmail, setCreateInAppWithEmail] = useState(false);

  // In-App tab state
  const [inappTitle, setInappTitle] = useState("");
  const [inappBody, setInappBody] = useState("");
  const [inappType, setInappType] = useState<string>("info");
  const [inappPriority, setInappPriority] = useState<string>("MEDIUM");
  const [inappLink, setInappLink] = useState("");

  const [historyPage, setHistoryPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<BroadcastStats>({
    queryKey: ["broadcast-stats"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/admin/broadcast/stats`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
  });

  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useQuery<HistoryResponse>({
    queryKey: ["broadcast-history", historyPage],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/admin/broadcast/history?page=${historyPage}&limit=10`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load history");
      return res.json();
    },
    enabled: tab === "history",
  });

  const pushMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/admin/broadcast/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: pushTitle, body: pushBody, url: pushUrl || undefined, createInAppNotification: createInAppWithPush }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      return data;
    },
    onSuccess: (data) => {
      toast.success("Push sent!", data.message);
      setPushTitle(""); setPushBody(""); setPushUrl("");
      refetchStats();
      invalidateNotifications();
      qc.invalidateQueries({ queryKey: ["broadcast-history"] });
    },
    onError: (err: any) => toast({ title: "Push failed", description: err.message, variant: "destructive" }),
  });

  const emailMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/admin/broadcast/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject: emailSubject, body: emailBody, recipientFilter, createInAppNotification: createInAppWithEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      return data;
    },
    onSuccess: (data) => {
      toast.success("Email sent!", data.message);
      setEmailSubject(""); setEmailBody("");
      if (createInAppWithEmail) invalidateNotifications();
      refetchStats();
      qc.invalidateQueries({ queryKey: ["broadcast-history"] });
    },
    onError: (err: any) => toast({ title: "Email failed", description: err.message, variant: "destructive" }),
  });

  const inappMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/admin/broadcast/inapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: inappTitle, body: inappBody, type: inappType, priority: inappPriority, link: inappLink || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      return data;
    },
    onSuccess: (data) => {
      toast.success("Notification sent!", data.message);
      setInappTitle(""); setInappBody(""); setInappLink(""); setInappType("info"); setInappPriority("MEDIUM");
      invalidateNotifications();
      qc.invalidateQueries({ queryKey: ["broadcast-history"] });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const emailRecipientCount = recipientFilter === "active" ? (stats?.activeUsers ?? 0) : (stats?.usersWithEmail ?? 0);
  const totalHistoryPages = history ? Math.ceil(history.total / 10) : 1;

  return {
    tab, setTab,
    // Push
    pushTitle, setPushTitle, pushBody, setPushBody, pushUrl, setPushUrl,
    createInAppWithPush, setCreateInAppWithPush,
    // Email
    emailSubject, setEmailSubject, emailBody, setEmailBody,
    recipientFilter, setRecipientFilter, createInAppWithEmail, setCreateInAppWithEmail,
    // In-App
    inappTitle, setInappTitle, inappBody, setInappBody,
    inappType, setInappType, inappPriority, setInappPriority, inappLink, setInappLink,
    // History
    historyPage, setHistoryPage, expandedId, setExpandedId,
    // Queries
    stats, statsLoading, refetchStats,
    history, historyLoading, refetchHistory,
    // Mutations
    pushMutation, emailMutation, inappMutation,
    // Derived
    emailRecipientCount, totalHistoryPages,
  };
}
