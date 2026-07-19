import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";

interface ServiceCardProps {
  service: any;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Single service grid card — name, description, price, inactive badge,
 * and edit / delete action buttons.
 */
export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <div
      className={`bg-card border rounded-xl p-4 relative transition-all hover:shadow-sm ${!service.isActive ? "opacity-55" : ""}`}
      data-testid={`card-service-${service.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm truncate">{service.name}</h4>
            {!service.isActive && (
              <Badge variant="secondary" className="text-[10px] py-0 h-4">Inactive</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{service.description}</p>
          <p className="text-base md:text-lg font-bold text-primary mt-2">
            ₹{service.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
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
