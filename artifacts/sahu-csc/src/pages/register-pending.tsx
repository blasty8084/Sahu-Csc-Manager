import { Link } from "wouter";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginLogo } from "@/components/app-logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

function PendingCard() {
  const { t } = useTranslation();
  const steps = [
    t("auth.register.pending_step1"),
    t("auth.register.pending_step2"),
    t("auth.register.pending_step3"),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center text-center gap-5"
    >
      <div className="relative">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(251,191,36,0.12)" }}>
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-white">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">{t("auth.register.pending_submitted")}</h2>
        <p className="text-gray-500 text-sm mt-2 max-w-xs leading-relaxed">
          {t("auth.register.pending_desc")}
        </p>
      </div>

      <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-1.5">
        <p className="text-xs font-bold text-amber-800">{t("auth.register.pending_next")}</p>
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-200 text-amber-700 text-[9px] font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="text-xs text-amber-700">{step}</p>
          </div>
        ))}
      </div>

      <Link href="/login">
        <Button className="w-full h-11 font-semibold" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("auth.register.back_to_login")}
        </Button>
      </Link>
    </motion.div>
  );
}

export default function RegisterPending() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0B1340" }}>
        <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center relative">
          <LoginLogo size={52} />
          <div className="mt-2.5">
            <h1 className="text-xl font-black">
              <span className="text-white">SAHU </span>
              <span style={{ color: "#F97316" }}>CSC</span>
            </h1>
            <p className="text-white/50 text-xs">{t("common.platform")}</p>
          </div>
        </div>
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1 bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 pt-8 pb-8">
            <PendingCard />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0B1340" }}>
      <div className="w-[45%] flex flex-col justify-center px-16 py-12">
        <div className="flex items-center gap-3 mb-10">
          <LoginLogo size={36} />
          <div>
            <span className="text-white font-black text-lg">SAHU </span>
            <span className="font-black text-lg" style={{ color: "#F97316" }}>CSC</span>
            <p className="text-white/40 text-xs -mt-0.5">{t("common.platform")}</p>
          </div>
        </div>
        <h1 className="text-4xl font-black leading-tight">
          <span className="text-white">{t("auth.register.pending_submitted")}</span>
        </h1>
        <p className="text-white/45 mt-4 max-w-sm leading-relaxed">
          {t("auth.register.pending_subtitle")}
        </p>
      </div>
      <div className="w-[55%] flex items-center justify-center px-10 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl px-8 py-10">
          <PendingCard />
        </div>
      </div>
    </div>
  );
}
