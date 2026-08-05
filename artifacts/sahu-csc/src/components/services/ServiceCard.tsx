import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, FileText, Shield, Home, Clipboard, Smartphone, Image, Printer, CreditCard, Copy, Scan, HeartPulse, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";

const ICON_MAP: Record<string, React.ElementType> = {
  "file-text": FileText,
  "shield": Shield,
  "home": Home,
  "clipboard": Clipboard,
  "smartphone": Smartphone,
  "image": Image,
  "printer": Printer,
  "credit-card": CreditCard,
  "copy": Copy,
  "scan": Scan,
  "heart-pulse": HeartPulse,
};

const CATEGORY_LABELS: Record<string, string> = {
  government: "Government",
  recharge: "Recharge",
  print: "Print & Scan",
};

interface ServiceCardProps {
  service: any;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Single service grid card — name (with i18n), icon, color dot, category badge,
 * price, inactive badge, and edit / delete action buttons.
 */
export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  // Pick localised name based on active language; fall back to English name
  const displayName =
    (lang === "hi" && service.nameHi) ? service.nameHi :
    (lang === "or" && service.nameOr) ? service.nameOr :
    service.name;

  const IconComponent = service.icon ? (ICON_MAP[service.icon] ?? Briefcase) : Briefcase;
  const categoryLabel = CATEGORY_LABELS[service.category] ?? service.category;

  return (
    <div
      className={`bg-card border rounded-xl p-4 relative transition-all hover:shadow-sm ${!service.isActive ? "opacity-55" : ""}`}
      data-testid={`card-service-${service.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Color icon badge */}
          <div
            className="flex-shrink-0 rounded-xl flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              background: service.color ?? "#6B7280",
              boxShadow: `0 4px 12px ${service.color ?? "#6B7280"}40`,
            }}
          >
            <IconComponent size={18} color="#fff" strokeWidth={2} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm truncate">{displayName}</h4>
              {!service.isActive && (
                <Badge variant="secondary" className="text-[10px] py-0 h-4">Inactive</Badge>
              )}
            </div>
            {/* Show English name as subtitle when a localised name is active */}
            {displayName !== service.name && (
              <p className="text-[10px] text-muted-foreground">{service.name}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className="text-[10px] py-0 h-4 font-medium"
                style={{ borderColor: service.color ?? undefined, color: service.color ?? undefined }}
              >
                {categoryLabel}
              </Badge>
              {service.parentService && (
                <span className="text-[10px] text-muted-foreground">↳ {service.parentService}</span>
              )}
            </div>
            <p className="text-base md:text-lg font-bold text-primary mt-1.5">
              ₹{parseFloat(service.price ?? "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="flex gap-1 ml-1 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil size={13} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}
