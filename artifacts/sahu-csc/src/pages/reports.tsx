import { useIsMobile } from "@/hooks/use-mobile";
import { Layout } from "@/components/layout";
import MobileReports from "@/components/reports/MobileReports";
import DesktopReports from "@/components/reports/DesktopReports";

// ══════════════════════════════════════════════════════════════════════════════
// ENTRY POINT
// ══════════════════════════════════════════════════════════════════════════════
export default function Reports() {
  const isMobile = useIsMobile();
  return (
    <Layout>
      {isMobile ? <MobileReports /> : <DesktopReports />}
    </Layout>
  );
}
