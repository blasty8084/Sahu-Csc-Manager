import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface Props {
  countdown: number;
  onBack: () => void;
}

export function ForgotSuccessStep({ countdown, onBack }: Props) {
  return (
    <motion.div key="fp-success" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-center pt-4">
      <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
        className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg mb-4"
        style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
        <CheckCircle2 className="w-8 h-8 text-white" />
      </motion.div>
      <h2 className="text-gray-900 font-bold text-xl mb-2">Password Reset!</h2>
      <p className="text-gray-500 text-sm max-w-xs mb-6">Your password has been updated. You can now log in with your new password.</p>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 font-bold text-white text-lg"
        style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
        {countdown}
      </div>
      <p className="text-gray-400 text-xs mb-6">Returning to login in {countdown}s</p>
      <Button onClick={onBack} className="w-full h-11 font-bold text-white border-0" style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
        Back to Login
      </Button>
    </motion.div>
  );
}
