import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetSettings } from "@workspace/api-client-react";
import { apiFetch, type AllTx, type AllTxResponse } from "./aeps.constants";
import { AllTxFilterBar } from "./all-tx/AllTxFilterBar";
import { AllTxTable } from "./all-tx/AllTxTable";

// ─────────────────────────────────────────────────────────
// All Transactions Tab
// ─────────────────────────────────────────────────────────
export function AllTransactionsTab() {
  const { data: bizSettings } = useGetSettings();
  const businessName = (bizSettings as any)?.businessName ?? "SAHU CSC";
  const businessAddress = (bizSettings as any)?.businessAddress ?? "";
  const businessMobile = (bizSettings as any)?.businessMobile ?? "";
  const businessWebsite = (bizSettings as any)?.businessWebsite ?? "";

  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [customerName, setCustomerName] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (typeFilter && typeFilter !== "all") params.set("type", typeFilter);
  if (customerName) params.set("customerName", customerName);

  const { data, isLoading } = useQuery<AllTxResponse>({
    queryKey: ["aeps-all-tx", page, startDate, endDate, typeFilter, customerName],
    queryFn: () => apiFetch(`/api/aeps/transactions?${params.toString()}`),
  });

  const allTabCustomerNames = useMemo(() => {
    const names = new Set<string>();
    data?.transactions?.forEach((t: AllTx) => { if (t.customerName) names.add(t.customerName); });
    return Array.from(names).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const clearFilters = () => { setStartDate(""); setEndDate(""); setTypeFilter("all"); setCustomerName(""); setPage(1); };
  const hasFilters = !!(startDate || endDate || (typeFilter && typeFilter !== "all") || customerName);
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);
  const pageWithdrawals = data?.transactions.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0) ?? 0;
  const pageDeposits = data?.transactions.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0) ?? 0;

  return (
    <div className="space-y-4">
      <AllTxFilterBar
        showFilters={showFilters} setShowFilters={setShowFilters}
        startDate={startDate} setStartDate={setStartDate}
        endDate={endDate} setEndDate={setEndDate}
        typeFilter={typeFilter} setTypeFilter={setTypeFilter}
        customerName={customerName} setCustomerName={setCustomerName}
        hasFilters={hasFilters} clearFilters={clearFilters}
        total={total} allTabCustomerNames={allTabCustomerNames}
        setPage={setPage} data={data}
      />
      <AllTxTable
        data={data} isLoading={isLoading}
        page={page} setPage={setPage}
        total={total} totalPages={totalPages}
        hasFilters={hasFilters} clearFilters={clearFilters}
        pageWithdrawals={pageWithdrawals} pageDeposits={pageDeposits}
        allTabCustomerNames={allTabCustomerNames}
        businessName={businessName} businessAddress={businessAddress}
        businessMobile={businessMobile} businessWebsite={businessWebsite}
      />
    </div>
  );
}

export default AllTransactionsTab;
