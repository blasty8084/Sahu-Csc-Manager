import { Layout } from "@/components/layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileDashboard } from "@/components/dashboard/MobileDashboard";
import { DesktopDashboard } from "@/components/dashboard/DesktopDashboard";

export default function Dashboard() {
  const isMobile = useIsMobile();
  return (
    <Layout>
      {isMobile ? <MobileDashboard /> : <DesktopDashboard />}
    </Layout>
  );
}
