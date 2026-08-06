import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Petit bouton "×" à positionner en absolute sur une carte de liste éditable (survol). */
export const RemoveItemButton = ({ onClick, label }: { onClick: () => void; label?: string }) => (
  <button
    type="button"
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
    title={label || "Supprimer"}
    className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
  >
    <X className="w-3.5 h-3.5" />
  </button>
);

/** Carte fantôme "+ Ajouter" à la fin d'une grille d'éléments éditables (ex. piliers, bandeau). */
export const AddCardButton = ({ onClick, label, className }: { onClick: () => void; label: string; className?: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#e3bd51]/40 rounded-md text-[#e3bd51] hover:bg-[#e3bd51]/5 hover:border-[#e3bd51] transition-colors min-h-[140px]",
      className,
    )}
  >
    <Plus className="w-5 h-5" />
    <span className="text-lvl-footer font-bold uppercase tracking-wider">{label}</span>
  </button>
);

/** Petit lien "+ Ajouter" en ligne, pour des listes de texte (bullets, valeurs...). */
export const AddInlineButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 text-lvl-footer font-bold uppercase tracking-wider text-[#e3bd51] hover:text-[#d4af37] transition-colors mt-2"
  >
    <Plus className="w-3.5 h-3.5" /> {label}
  </button>
);
