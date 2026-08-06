import { useEffect, useRef, useState } from "react";
import { Pencil, Loader2, Check, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useIsEditMode } from "@/lib/EditModeContext";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface EditableTextProps {
  /** Valeur actuelle, telle qu'affichée sur le site public. */
  value: string;
  /** Persiste la nouvelle valeur (appelé après une pause de frappe). */
  onSave: (newValue: string) => Promise<any>;
  /** Champ multi-lignes (Textarea) plutôt qu'une simple ligne (Input). */
  multiline?: boolean;
  /** Nom du champ affiché en haut du popover, ex. "Titre du bandeau". */
  label?: string;
  placeholder?: string;
  /** "span" pour du texte en ligne (dans un h1/p), "div" pour un bloc. */
  as?: "span" | "div";
  className?: string;
}

/**
 * Rend `value` tel quel sur le site public (isEditMode=false) — aucune
 * différence visuelle ou structurelle avec le composant d'origine.
 * Dans l'éditeur visuel de l'admin (isEditMode=true), ajoute un contour au
 * survol + une icône crayon ; cliquer ouvre un petit popover d'édition qui
 * enregistre automatiquement après une pause de frappe.
 */
export const EditableText = ({
  value, onSave, multiline, label, placeholder, as = "span", className,
}: EditableTextProps) => {
  const isEditMode = useIsEditMode();
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (!isEditMode) return <>{value}</>;

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

  const Wrapper = as;
  const Field = multiline ? Textarea : Input;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Wrapper
          className={cn(
            "group relative cursor-pointer rounded-sm outline-dashed outline-1 outline-offset-2 transition-colors",
            as === "span" ? "inline-block" : "block",
            open ? "outline-[#e3bd51]" : "outline-transparent hover:outline-[#e3bd51]/50",
            className,
          )}
        >
          {value || <span className="text-current opacity-40 italic">{placeholder || "Cliquer pour éditer"}</span>}
          <span
            className={cn(
              "absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-[#e3bd51] text-black items-center justify-center shadow-md flex transition-opacity z-10",
              open ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
          >
            <Pencil className="w-2.5 h-2.5" />
          </span>
        </Wrapper>
      </PopoverTrigger>
      <PopoverContent className="w-80 z-[200] space-y-3" onCloseAutoFocus={(e) => e.preventDefault()}>
        {label && <Label className="text-lvl-footer text-muted-foreground uppercase tracking-wider">{label}</Label>}
        <Field
          autoFocus
          value={draft}
          placeholder={placeholder}
          onChange={(e) => handleChange(e.target.value)}
          className={multiline ? "min-h-[100px]" : ""}
        />
        <div className="flex items-center gap-1.5 text-lvl-footer text-muted-foreground h-4">
          {status === "saving" && <><Loader2 className="w-3 h-3 animate-spin" /> Enregistrement...</>}
          {status === "saved" && <><Check className="w-3 h-3 text-green-600" /> Enregistré</>}
          {status === "error" && <><AlertCircle className="w-3 h-3 text-destructive" /> Erreur d'enregistrement</>}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EditableText;
