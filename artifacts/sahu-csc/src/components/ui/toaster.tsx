import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"

type Variant = "default" | "destructive" | "success" | "warning"

const DURATION = 4500

const VARIANT_CONFIG: Record<Variant, {
  icon: React.ReactNode
  accent: string
  iconBg: string
  iconColor: string
}> = {
  default: {
    icon: <Info className="h-4 w-4" />,
    accent: "#0b2c60",
    iconBg: "rgba(11,44,96,0.12)",
    iconColor: "#0b2c60",
  },
  destructive: {
    icon: <XCircle className="h-4 w-4" />,
    accent: "#ef4444",
    iconBg: "rgba(239,68,68,0.12)",
    iconColor: "#ef4444",
  },
  success: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    accent: "#16a34a",
    iconBg: "rgba(22,163,74,0.12)",
    iconColor: "#16a34a",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    accent: "#d97706",
    iconBg: "rgba(217,119,6,0.12)",
    iconColor: "#d97706",
  },
}

interface ToastItemProps {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: Variant
  isTop: boolean
  dismiss: (id: string) => void
}

function ToastItem({ id, title, description, variant = "default", isTop, dismiss }: ToastItemProps) {
  const cfg = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.default
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const enterY = isTop ? -64 : 64
  const exitY  = isTop ? -20 : 20

  useEffect(() => {
    timerRef.current = setTimeout(() => dismiss(id), DURATION)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [id, dismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: enterY, scale: 0.92, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{
        opacity: 0,
        y: exitY,
        scale: 0.93,
        filter: "blur(3px)",
        transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
      }}
      transition={{ type: "spring", stiffness: 460, damping: 34, mass: 0.8 }}
      className="relative w-full overflow-hidden rounded-2xl bg-white"
      style={{
        borderLeft: `4px solid ${cfg.accent}`,
        boxShadow: "0 8px 40px -6px rgba(0,0,0,0.18), 0 2px 12px -2px rgba(0,0,0,0.10)",
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5 pr-11">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: cfg.iconBg }}
        >
          <span style={{ color: cfg.iconColor }}>{cfg.icon}</span>
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          {title && (
            <p className="text-[13px] font-semibold leading-snug text-gray-900">{title}</p>
          )}
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{description}</p>
          )}
        </div>
      </div>

      <button
        onClick={() => dismiss(id)}
        className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-95"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gray-100">
        <motion.div
          className="h-full origin-left rounded-full"
          style={{ background: cfg.accent }}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: DURATION / 1000, ease: "linear" }}
        />
      </div>
    </motion.div>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const isMobile = useIsMobile()

  const visible = toasts.filter((t) => t.open !== false)

  return (
    <div
      className={
        isMobile
          ? "fixed left-1/2 top-4 z-[200] flex w-[calc(100vw-2rem)] max-w-[420px] -translate-x-1/2 flex-col gap-2"
          : "fixed bottom-4 right-4 z-[200] flex w-[360px] flex-col gap-2.5"
      }
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="sync" initial={false}>
        {visible.map(({ id, title, description, variant }) => (
          <ToastItem
            key={id}
            id={id}
            title={title}
            description={description}
            variant={(variant ?? "default") as Variant}
            isTop={!!isMobile}
            dismiss={dismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
