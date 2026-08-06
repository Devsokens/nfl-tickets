import { useState } from "react";
import { ExternalLink, Home, GraduationCap, Mail, CalendarDays } from "lucide-react";
import { EditModeProvider } from "@/lib/EditModeContext";
import Index from "@/pages/Index";
import Contact from "@/pages/Contact";
import CatalogueFormation from "@/pages/CatalogueFormation";
import Catalog from "@/pages/Catalog";
import { cn } from "@/lib/utils";

type EditorPage = "home" | "events" | "catalogue-formations" | "contact";

const PAGES: { key: EditorPage; label: string; path: string; icon: typeof Home }[] = [
  { key: "home", label: "Accueil", path: "/", icon: Home },
  { key: "events", label: "Événements", path: "/events", icon: CalendarDays },
  { key: "catalogue-formations", label: "Catalogue Formations", path: "/catalogue-formations", icon: GraduationCap },
  { key: "contact", label: "Contact", path: "/contact", icon: Mail },
];

/**
 * Éditeur visuel : reprend tel quel le composant de chaque page publique
 * (mêmes styles, même mise en page) et l'enrobe d'un EditModeProvider pour
 * activer les contrôles d'édition inline.
 *
 * Rendu comme un module normal de l'admin (sidebar + header toujours
 * visibles) plutôt qu'en plein écran : le panneau d'aperçu ci-dessous a sa
 * propre zone de défilement, et porte la classe `transform` pour devenir le
 * "containing block" CSS des éléments en `position: fixed` qu'il contient
 * (la Navbar publique, notamment) — elle reste ainsi collée en haut du
 * panneau au lieu de flotter sur toute la fenêtre du navigateur par-dessus
 * la sidebar de l'admin.
 */
export const VisualEditorTab = () => {
  const [page, setPage] = useState<EditorPage>("home");
  const current = PAGES.find((p) => p.key === page)!;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lvl-subtitle font-bold">Éditeur visuel</h2>
          <p className="text-lvl-footer text-muted-foreground mt-1">Cliquez directement sur un texte, une image ou une icône ci-dessous pour le modifier.</p>
        </div>
        <a
          href={current.path}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-gold hover:text-gold/80 text-lvl-footer font-bold uppercase tracking-wider transition-colors shrink-0"
        >
          Voir cette page en ligne <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <nav className="flex items-center gap-2 bg-secondary/30 border border-border/50 rounded-2xl p-1.5 w-fit">
        {PAGES.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.key}
              onClick={() => setPage(p.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-lvl-footer font-bold uppercase tracking-wider transition-colors",
                page === p.key ? "bg-gold text-[#32140c] shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-white/5",
              )}
            >
              <Icon className="h-4 w-4" /> {p.label}
            </button>
          );
        })}
      </nav>

      {/* Panneau d'aperçu confiné : `transform` en fait le containing block
          des éléments fixed qu'il contient (ex. la Navbar publique). */}
      <div
        className="relative transform rounded-3xl border border-border/50 shadow-2xl overflow-y-auto overflow-x-hidden flex-1 min-h-[600px] bg-background"
        style={{ height: "calc(100vh - 320px)" }}
      >
        <EditModeProvider key={page}>
          {page === "home" && <Index />}
          {page === "events" && <Catalog />}
          {page === "catalogue-formations" && <CatalogueFormation />}
          {page === "contact" && <Contact />}
        </EditModeProvider>
      </div>
    </div>
  );
};

export default VisualEditorTab;
