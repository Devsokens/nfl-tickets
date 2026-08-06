import { useState } from "react";
import { Pencil } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { ICON_NAMES, getIcon } from "@/lib/iconMap";
import { useIsEditMode } from "@/lib/EditModeContext";
import { cn } from "@/lib/utils";

interface EditableIconProps {
  value?: string;
  onSave: (newIconName: string) => Promise<any>;
  /** Classes appliquées à l'icône elle-même (taille, couleur...). */
  className?: string;
}

/**
 * Rend l'icône choisie telle quelle sur le site public. Dans l'éditeur
 * visuel, un survol affiche un crayon ; cliquer ouvre une grille d'icônes
 * (registre fermé, voir lib/iconMap.ts) pour la remplacer.
 */
export const EditableIcon = ({ value, onSave, className }: EditableIconProps) => {
  const isEditMode = useIsEditMode();
  const [open, setOpen] = useState(false);
  const Icon = getIcon(value);

  if (!isEditMode) return <Icon className={className} />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span className={cn("group relative inline-flex cursor-pointer rounded-sm outline-dashed outline-1 outline-offset-4", open ? "outline-[#e3bd51]" : "outline-transparent hover:outline-[#e3bd51]/50")}>
          <Icon className={className} />
          <span className={cn("absolute -top-3 -right-3 w-5 h-5 rounded-full bg-[#e3bd51] text-black items-center justify-center shadow-md flex transition-opacity z-10", open ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
            <Pencil className="w-2.5 h-2.5" />
          </span>
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-64 z-[200] space-y-2">
        <Label className="text-lvl-footer text-muted-foreground uppercase tracking-wider">Choisir une icône</Label>
        <div className="grid grid-cols-5 gap-2">
          {ICON_NAMES.map((name) => {
            const ItemIcon = getIcon(name);
            return (
              <button
                key={name}
                title={name}
                onClick={async () => { await onSave(name); setOpen(false); }}
                className={cn(
                  "h-10 w-10 flex items-center justify-center rounded-lg border transition-colors",
                  value === name ? "border-[#e3bd51] bg-[#e3bd51]/10 text-[#e3bd51]" : "border-border/50 hover:border-[#e3bd51]/40",
                )}
              >
                <ItemIcon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EditableIcon;
