import { useRef } from "react";
import { Camera, FolderOpen, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface MediaPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onFileSelected: (f: File) => void;
}

export function MediaPickerDialog({ open, onClose, onFileSelected }: MediaPickerDialogProps) {
  const { toast } = useToast();
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const ACCEPTED = "image/jpeg,image/png,image/webp,image/heic,image/heif";

  const validate = (file: File) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!ok.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
      toast({ title: "Unsupported format", description: "JPG, PNG, WEBP or HEIC only.", variant: "destructive" });
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5 MB.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !validate(file)) return;
    onFileSelected(file);
    onClose();
  };

  return (
    <>
      <input ref={camRef} type="file" accept={ACCEPTED} capture="user" className="hidden" onChange={handleChange} />
      <input ref={galRef} type="file" accept={ACCEPTED} className="hidden" onChange={handleChange} />
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Update Profile Picture</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3 pt-1">
            <button
              type="button"
              onClick={() => { onClose(); setTimeout(() => camRef.current?.click(), 80); }}
              className="flex items-center gap-4 p-4 rounded-xl border hover:bg-accent hover:border-primary/40 transition-colors text-left group"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Camera size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Take a Photo</p>
                <p className="text-xs text-muted-foreground">Open camera</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { onClose(); setTimeout(() => galRef.current?.click(), 80); }}
              className="flex items-center gap-4 p-4 rounded-xl border hover:bg-accent hover:border-primary/40 transition-colors text-left group"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <FolderOpen size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Choose from Gallery</p>
                <p className="text-xs text-muted-foreground">Browse photos on this device</p>
              </div>
            </button>
          </div>
          <div className="flex items-start gap-2 mt-1 p-3 rounded-lg bg-muted/50">
            <AlertCircle size={13} className="text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">JPG, PNG, WEBP or HEIC · max 5 MB</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
