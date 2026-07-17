import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { UdhariCustomerHeaderSkeleton } from "@/components/skeletons";
import { useGetUdhariCustomer, useListUdhariEntries, useGetSettings } from "@workspace/api-client-react";
import { UdhariReceiptModal } from "@/components/udhari-receipt-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { UdhariCustomerHeader } from "@/components/udhari/customer/UdhariCustomerHeader";
import { UdhariCustomerStats } from "@/components/udhari/customer/UdhariCustomerStats";
import { UdhariEntryList } from "@/components/udhari/customer/UdhariEntryList";
import { UdhariAddEntryForm } from "@/components/udhari/customer/UdhariAddEntryForm";

export default function UdhariCustomer() {
  const { customerId } = useParams<{ customerId: string }>();
  const id = parseInt(customerId ?? "0");
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  const { data: customer, isLoading: custLoading } = useGetUdhariCustomer(id);
  const { data: entries = [], isLoading: entriesLoading } = useListUdhariEntries(id);
  const { data: bizSettings } = useGetSettings();
  const businessName    = (bizSettings as any)?.businessName    ?? "SAHU CSC";
  const businessAddress = (bizSettings as any)?.businessAddress ?? "";
  const businessMobile  = (bizSettings as any)?.businessMobile  ?? "";
  const businessWebsite = (bizSettings as any)?.businessWebsite ?? "";

  const [entryDialog, setEntryDialog] = useState<{ open: boolean; mode: "gave" | "got"; existing?: any }>({ open: false, mode: "gave" });
  const [receiptEntry, setReceiptEntry] = useState<any>(null);

  if (custLoading) return <Layout><UdhariCustomerHeaderSkeleton /></Layout>;
  if (!customer) return (
    <Layout>
      <div className="text-center py-20">
        <p className="text-muted-foreground">Customer not found</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setLocation("/udhari")}>
          Back to Udhari Khata
        </Button>
      </div>
    </Layout>
  );

  const c = customer as any;
  const entryList = entries as any[];

  return (
    <Layout>
      <div className={isMobile ? "space-y-4 pb-24" : "space-y-5"}>
        <UdhariCustomerHeader
          customer={c}
          entries={entryList}
          isMobile={isMobile}
          onBack={() => setLocation("/udhari")}
          onGave={() => setEntryDialog({ open: true, mode: "gave" })}
          onGot={() => setEntryDialog({ open: true, mode: "got" })}
          onDeleted={() => setLocation("/udhari")}
        />
        <UdhariCustomerStats balance={c.balance} />
        <UdhariEntryList
          customerId={id}
          entries={entryList}
          loading={entriesLoading}
          onEdit={(e) => setEntryDialog({ open: true, mode: e.type, existing: e })}
          onReceipt={(e) => setReceiptEntry({ entry: e, customer: c })}
        />
      </div>

      {entryDialog.open && (
        <UdhariAddEntryForm
          customerId={id}
          mode={entryDialog.mode}
          existing={entryDialog.existing}
          open={entryDialog.open}
          onClose={() => setEntryDialog({ open: false, mode: "gave" })}
          customer={c}
        />
      )}

      <UdhariReceiptModal
        open={receiptEntry !== null}
        entry={receiptEntry ? (() => {
          const e = receiptEntry.entry;
          const cust = receiptEntry.customer;
          return {
            id: e.id, type: e.type as "gave" | "got", amount: e.amount,
            customerName: cust.name, customerMobile: cust.mobile ?? null,
            customerAddress: cust.address ?? null, note: e.note ?? null,
            date: e.date, createdAt: e.createdAt ?? new Date().toISOString(),
            currentBalance: cust.balance, receiptToken: e.receiptToken ?? null,
          };
        })() : null}
        onClose={() => setReceiptEntry(null)}
        businessName={businessName}
        businessAddress={businessAddress}
        businessMobile={businessMobile}
        businessWebsite={businessWebsite}
      />
    </Layout>
  );
}
