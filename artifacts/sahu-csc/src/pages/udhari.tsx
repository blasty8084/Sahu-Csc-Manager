import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useListUdhariCustomers } from "@workspace/api-client-react";
import { Plus, BookOpen } from "lucide-react";
import { UdhariSummaryBanner } from "@/components/udhari/UdhariSummaryBanner";
import { UdhariSearchBar } from "@/components/udhari/UdhariSearchBar";
import { UdhariCustomerList } from "@/components/udhari/UdhariCustomerList";
import { UdhariAddCustomerDialog } from "@/components/udhari/UdhariAddCustomerDialog";

export default function Udhari() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recent");
  const [showAdd, setShowAdd] = useState(false);

  const { data: customers = [], isLoading } = useListUdhariCustomers({ q: q || undefined, sort: sort as any });

  const sorted = useMemo(() => {
    let list = [...(customers as any[])];
    if (sort === "balance_desc") list.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
    else if (sort === "alpha") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [customers, sort]);

  const go = (id: number) => setLocation(`/udhari/${id}`);

  return (
    <Layout>
      <div className="space-y-4 pb-6 sm:space-y-5 sm:pb-0">

        {/* Page header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)" }}>
              <BookOpen size={14} color="#fff" />
            </div>
            <div>
              <h1 className="font-black text-lg leading-tight" style={{ color: "#0b2c60" }}>
                {t("udhari.title")}
              </h1>
              <p className="text-[11px] text-muted-foreground leading-none">{t("udhari.subtitle")}</p>
            </div>
          </div>
          <Button size="sm" className="hidden sm:flex" onClick={() => setShowAdd(true)}
            style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff" }}>
            <Plus size={14} className="mr-1" /> {t("udhari.add_customer")}
          </Button>
        </div>

        <UdhariSummaryBanner />
        <UdhariSearchBar q={q} setQ={setQ} sort={sort} setSort={setSort} />
        <UdhariCustomerList sorted={sorted} isLoading={isLoading} go={go} />

        {/* Mobile FAB */}
        <button
          onClick={() => setShowAdd(true)}
          className="sm:hidden fixed bottom-20 right-5 w-14 h-14 rounded-full flex items-center justify-center z-30 shadow-lg"
          style={{ background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", boxShadow: "0 4px 20px rgba(11,44,96,0.40)" }}>
          <Plus size={24} color="#fff" />
        </button>
      </div>

      <UdhariAddCustomerDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </Layout>
  );
}
