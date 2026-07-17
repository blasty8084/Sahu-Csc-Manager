import { Layout } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AboutHeroSection from "@/components/about/AboutHeroSection";
import AboutVersionHistory from "@/components/about/AboutVersionHistory";
import AboutFeatureCard from "@/components/about/AboutFeatureCard";
import AboutStats from "@/components/about/AboutStats";
import AboutTeamSection from "@/components/about/AboutTeamSection";

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">

        <AboutHeroSection />

        <Tabs defaultValue="changelog">
          <TabsList className="grid grid-cols-3 w-full h-10">
            <TabsTrigger value="changelog"    className="text-[11px] sm:text-sm px-1">Changelog</TabsTrigger>
            <TabsTrigger value="sysreq"       className="text-[11px] sm:text-sm px-1">Features</TabsTrigger>
            <TabsTrigger value="architecture" className="text-[11px] sm:text-sm px-1">Tech Stack</TabsTrigger>
          </TabsList>

          <TabsContent value="changelog" className="mt-4">
            <AboutVersionHistory />
          </TabsContent>

          <TabsContent value="sysreq" className="mt-4">
            <AboutFeatureCard />
          </TabsContent>

          <TabsContent value="architecture" className="mt-4">
            <AboutStats />
          </TabsContent>
        </Tabs>

        <AboutTeamSection />

      </div>
    </Layout>
  );
}
