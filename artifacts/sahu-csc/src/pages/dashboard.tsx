import { Layout } from "@/components/layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileDashboard } from "@/components/dashboard/MobileDashboard";
import { DesktopDashboard } from "@/components/dashboard/DesktopDashboard";
import { useAutoPushSetup } from "@/hooks/use-auto-push-setup";

export default function Dashboard() {
  const isMobile = useIsMobile();
  // Automatically request push-notification permission on first load and
  // subscribe immediately when the user taps "Allow".
  useAutoPushSetup();
  return (
    <Layout>
      {isMobile ? <MobileDashboard /> : <DesktopDashboard />}
    </Layout>
  );
}
