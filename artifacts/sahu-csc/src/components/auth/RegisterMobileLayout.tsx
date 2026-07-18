/**
 * RegisterMobileLayout — navy header + slide-up white card for the mobile register screen.
 */
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { LoginLogo } from "@/components/app-logo";

interface Props {
  children: React.ReactNode;
}

export function RegisterMobileLayout({ children }: Props) {
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0B1340" }}>
      {/* Navy header */}
      <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center relative">
        <Link href="/login">
          <button
            className="absolute left-4 top-6 w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
        </Link>
        <LoginLogo size={52} />
        <div className="mt-2.5 space-y-0">
          <h1 className="text-xl font-black">
            <span className="text-white">SAHU </span>
            <span style={{ color: "#F97316" }}>CSC</span>
          </h1>
          <p className="text-white/50 text-xs">Management Platform</p>
        </div>
      </div>

      {/* Slide-up white card */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1 bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
