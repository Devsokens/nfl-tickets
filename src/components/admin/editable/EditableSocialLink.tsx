import { useEffect, useRef, useState } from "react";
import { Pencil, Loader2, Check, AlertCircle, type LucideIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsEditMode } from "@/lib/EditModeContext";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface EditableSocialLinkProps {
  url?: string;
  onSave: (newUrl: string) => Promise<any>;
  icon: LucideIcon;
  label: string;
}

/**
 * Icône de réseau social. Sur le site public : masquée si aucune URL n'est
 * renseignée (comportement identique à avant). Dans l'éditeur visuel :
 * toujours visible (en pointillés si vide) pour permettre d'ajouter un lien,
 * avec un popover d'édition de l'URL en auto-save.
 */
export const EditableSocialLink = ({ url, onSave, icon: Icon, label }: EditableSocialLinkProps) => {
  const isEditMode = useIsEditMode();
  const [draft, setDraft] = useState(url || "");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setDraft(url || ""), [url]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (!isEditMode) {
    if (!url) return null;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-white/20 flex items-center justify-center text-white/70 hover:text-[#c29c38] hover:border-[#c29c38] transition-colors rounded-none">
        <Icon className="w-3.5 h-3.5" />
      </a>
    );
  }

  const handleChange = (newVal: string) => {
    setDraft(newVal);
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("saving");
    timerRef.current = setTimeout(async () => {
      try {
        await onSave(newVal);
        setStatus("saved");
        setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1800);
      } catch {
        setStatus("error");
      }
    }, 900);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative w-8 h-8 border flex items-center justify-center transition-colors rounded-none",
            url ? "border-white/20 text-white/70" : "border-dashed border-white/25 text-white/30",
            open && "border-[#e3bd51] text-[#e3bd51]",
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className={cn("absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#e3bd51] text-black flex items-center justify-center transition-opacity", open ? "opacity-100" : "opacity-70")}>
            <Pencil className="w-2 h-2" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 z-[200] space-y-2" onCloseAutoFocus={(e) => e.preventDefault()}>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</Label>
        <Input autoFocus value={draft} placeholder="https://..." onChange={(e) => handleChange(e.target.value)} />
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground h-4">
          {status === "saving" && <><Loader2 className="w-3 h-3 animate-spin" /> Enregistrement...</>}
          {status === "saved" && <><Check className="w-3 h-3 text-green-600" /> Enregistré</>}
          {status === "error" && <><AlertCircle className="w-3 h-3 text-destructive" /> Erreur</>}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EditableSocialLink;
