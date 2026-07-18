import { useState } from "react";
import { Layout } from "@/components/layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReceiptModal } from "@/components/receipt-modal";
import { useReceiptExport } from "@/hooks/useReceiptExport";
import { type MobileTab, type PreviewEntry } from "@/components/receipt-export/types";
import { DesktopExportLayout } from "@/components/receipt-export/DesktopExportLayout";
import { MobileExportLayout } from "@/components/receipt-export/MobileExportLayout";

export default function ReceiptExport() {
  const s = useReceiptExport();

  const [mobileTab,   setMobileTab]   = useState<MobileTab>("receipts");
  const [showPreview, setShowPreview] = useState(false);
  const [activeEntry, setActiveEntry] = useState<PreviewEntry | null>(null);

  const isMobile = useIsMobile();

  return (
    <Layout>
      {isMobile
        ? <MobileExportLayout
            s={s}
            mobileTab={mobileTab}     setMobileTab={setMobileTab}
            showPreview={showPreview} setShowPreview={setShowPreview}
            activeEntry={activeEntry} setActiveEntry={setActiveEntry}
          />
        : <DesktopExportLayout s={s} />
      }

      {/* Shared receipt modal — handles print / PDF / share / WhatsApp */}
      <ReceiptModal
        entry={s.modalEntry}
        open={s.modalOpen}
        onClose={() => { s.setModalOpen(false); s.setModalAction(null); }}
        businessName={s.business.businessName}
        businessAddress={s.business.businessAddress}
        businessMobile={s.business.businessMobile}
        businessWebsite={s.business.businessWebsite}
        autoAction={s.modalAction}
        onAutoActionComplete={() => s.setModalAction(null)}
      />
    </Layout>
  );
}
