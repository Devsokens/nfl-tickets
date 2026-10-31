import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useIsEditMode } from "@/lib/EditModeContext";
import { EditableText } from "@/components/admin/editable/EditableText";
import heroVideoPoster from "@/assets/nfl-tourisme.jpg";

export interface StatItem {
  number: string;
  label: string;
}

interface KeyStatsSectionProps {
  title?: string;
  subtitle?: string;
  stats?: StatItem[];
  videoUrl?: string;
  onSaveStat?: (index: number, field: string, val: string) => Promise<void>;
  onSaveTitle?: (val: string) => Promise<void>;
  onSaveSubtitle?: (val: string) => Promise<void>;
}

const DEFAULT_STATS: StatItem[] = [
  { number: "70+", label: "Entreprises Accompagnées" },
  { number: "9/10", label: "Taux de Satisfaction Client" },
  { number: "1200+", label: "Cadres & Leaders Formés" },
  { number: "25+", label: "Années d'Expérience Cumulées" },
];

// Composant de compteur animé quand visible à l'écran
function AnimatedCounter({ value = "" }: { value?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const raw = (value ?? "").trim();
  // Support des formats comme "9/10", "70+", "+50", "95%", "1200+" : seul le
  // premier nombre est animé, le reste est affiché tel quel.
  const match = raw.match(/^([^\d]*)(\d+)(.*)$/);
  const prefix = match ? match[1] : "";
  const targetNum = match ? parseInt(match[2], 10) : 0;
  const suffix = match ? match[3] : "";

  const [count, setCount] = useState(0);

  // Dépend uniquement du nombre cible : `match` est un nouveau tableau à chaque
  // rendu, l'avoir en dépendance relançait une animation depuis 0 à chaque image
  // (chiffres bloqués vers 0 qui « tremblent »).
  useEffect(() => {
    if (!isInView) return;

    const duration = 1800; // 1.8s
    const startTime = performance.now();
    let frame = 0;

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeProgress * targetNum));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, targetNum]);

  if (!match) {
    return <span ref={ref}>{raw}</span>;
  }

  return (
    <span ref={ref} className="inline-flex items-baseline tabular-nums">
      {prefix && <span className="text-[#8c591a] font-semibold mr-0.5">{prefix}</span>}
      <span>{count}</span>
      {suffix && <span className="text-[#8c591a] font-semibold ml-0.5">{suffix}</span>}
    </span>
  );
}

export const KeyStatsSection = ({
  title = "L'Excellence & L'Impact NFL",
  subtitle = "Des résultats concrets et mesurables qui témoignent de notre engagement auprès des entreprises et des dirigeants.",
  stats = DEFAULT_STATS,
  videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-business-people-meeting-in-a-modern-office-42776-large.mp4",
  onSaveStat,
  onSaveTitle,
  onSaveSubtitle,
}: KeyStatsSectionProps) => {
  const isEditMode = useIsEditMode();
  const displayStats = stats && stats.length > 0 ? stats.slice(0, 4) : DEFAULT_STATS;

  return (
    <section id="chiffres" className="section-y bg-[#fcfbfa] relative overflow-hidden text-[#100906] scroll-mt-20">
      {/* Halo de lumière en arrière-plan */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[500px] h-[500px] bg-[#d4af37]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#8a4216]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

          {/* ========================================================================= */}
          {/* COLONNE GAUCHE : TITRE ET GRILLE 2X2 DES CHIFFRES CLÉS (ANIMÉS) */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 space-y-8"
          >
            <div>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#121212]">
                {onSaveTitle ? (
                  <EditableText value={title} onSave={onSaveTitle} label="Titre de la section" />
                ) : (
                  title
                )}
              </h2>
              <p className="text-[#555] text-base sm:text-lg leading-relaxed font-normal mt-4 max-w-xl">
                {isEditMode && onSaveSubtitle ? (
                  <EditableText value={subtitle} onSave={onSaveSubtitle} label="Sous-titre de la section" multiline as="span" />
                ) : (
                  subtitle
                )}
              </p>
            </div>

            {/* Grille 2x2 avec bordures fines séparatrices (Design Maquette Référence) */}
            <div className="grid grid-cols-2 border-t border-black/10 pt-6">
              {displayStats.map((stat, idx) => {
                const isRightCol = idx % 2 === 1;
                const isBottomRow = idx >= 2;

                return (
                  <div
                    key={idx}
                    className={`p-5 sm:p-7 flex flex-col justify-center ${
                      !isRightCol ? "border-r border-black/10" : ""
                    } ${!isBottomRow ? "border-b border-black/10" : ""}`}
                  >
                    <div className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#121212] tracking-tight leading-none mb-2">
                      {isEditMode ? (
                        <EditableText
                          value={stat.number}
                          onSave={(v) => onSaveStat ? onSaveStat(idx, "number", v) : Promise.resolve()}
                          label="Chiffre"
                        />
                      ) : (
                        <AnimatedCounter value={stat.number} />
                      )}
                    </div>
                    <p className="text-[#666] text-xs sm:text-sm font-medium leading-snug">
                      {isEditMode ? (
                        <EditableText
                          value={stat.label}
                          onSave={(v) => onSaveStat ? onSaveStat(idx, "label", v) : Promise.resolve()}
                          label="Intitulé"
                        />
                      ) : (
                        stat.label
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* COLONNE DROITE : MOTION DESIGN CONTINU */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 relative"
          >
            {/* Conteneur principal motion design */}
            <div className="relative rounded-[2.5rem] overflow-hidden border border-black/10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.15)] group bg-black aspect-[4/3] sm:aspect-[16/11]">
              
              {/* Image haute qualité avec effet motion design */}
              <img
                src={heroVideoPoster}
                alt="NFL Motion Design"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter brightness-[0.95]"
              />

              {/* Surcouche dégradée et effets de brillance ambiants */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

              {/* Effet visuel motion central discret */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 rounded-full bg-[#d4af37]/20 blur-2xl animate-pulse" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default KeyStatsSection;
