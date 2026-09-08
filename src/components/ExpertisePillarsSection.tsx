import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronRight, ShieldCheck, Sparkles, Users, Award } from "lucide-react";
import { EditableText } from "@/components/admin/editable/EditableText";
import { EditableIcon } from "@/components/admin/editable/EditableIcon";
import { RemoveItemButton, AddCardButton } from "@/components/admin/editable/EditableListControls";
import { useIsEditMode } from "@/lib/EditModeContext";

// Assets local pour le visuel à gauche
import seminaireImg1 from "@/assets/nfl img 4.jpeg";
import seminaireImg2 from "@/assets/nfl img 5.jpeg";
import seminaireImg3 from "@/assets/hero-nfl.jpg";

import formationImg1 from "@/assets/nfl img1.jpeg";
import formationImg2 from "@/assets/nfl img2.jpeg";
import formationImg3 from "@/assets/nfl img 6.jpeg";

import academieImg1 from "@/assets/louise photo.jpeg";
import academieImg2 from "@/assets/louise2.jpeg";
import academieImg3 from "@/assets/nfl img3.jpeg";

interface Pillar {
  icon?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  link?: string;
}

interface ExpertisePillarsSectionProps {
  pillars: Pillar[];
  onSaveItemField: (index: number, field: string, value: any) => Promise<void>;
  onAddPillar: () => Promise<void>;
  onRemovePillar: (index: number) => Promise<void>;
}

// Données visuelles pour chaque pilier
const PILLAR_VISUALS = [
  {
    mainImg: seminaireImg1,
    subImg1: seminaireImg2,
    subImg2: seminaireImg3,
    statNumber: "100%",
    statLabel: "Séminaires sur mesure",
    badgeIcon: ShieldCheck,
    bullets: ["Logistique & Organisation clé en main", "Format immersif & prestige", "Lieux d'exception au Gabon"],
  },
  {
    mainImg: formationImg1,
    subImg1: formationImg2,
    subImg2: formationImg3,
    statNumber: "50+",
    statLabel: "Organisations formées",
    badgeIcon: Users,
    bullets: ["Modules de formation certifiants", "Approche pratique axée résultats", "Évaluation continue des compétences"],
  },
  {
    mainImg: academieImg2,
    subImg1: academieImg1,
    subImg2: academieImg3,
    statNumber: "1000+",
    statLabel: "Leaders & Cadres accompagnés",
    badgeIcon: Award,
    bullets: ["Coaching individuel & d'équipe", "Psychologie de la haute performance", "Leadership & Management d'élite"],
  },
];

export const ExpertisePillarsSection = ({
  pillars = [],
  onSaveItemField,
  onAddPillar,
  onRemovePillar,
}: ExpertisePillarsSectionProps) => {
  const isEditMode = useIsEditMode();
  const [activeIndex, setActiveIndex] = useState(0);

  const activePillar = pillars[activeIndex] || pillars[0] || {};
  const currentVisual = PILLAR_VISUALS[activeIndex % PILLAR_VISUALS.length];
  const BadgeIcon = currentVisual.badgeIcon || Sparkles;

  return (
    <section className="section-y bg-[#fdfbf7] relative overflow-hidden text-[#100906]">
      {/* Background Accent Mesh & Grid */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4af37]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[#8a4216]/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10 max-w-7xl">
        {/* Header de section animé à l'atterrissage sur la section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#100906] tracking-tight">
            Nos Piliers d'Accompagnement
          </h2>
          <div className="w-20 h-[3px] bg-gradient-to-r from-[#8a4216] via-[#d4af37] to-[#8a4216] mx-auto mt-5 rounded-full" />
        </motion.div>

        {/* Grille principale 2 colonnes avec animation d'atterrissage sur la section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* ========================================================================= */}
          {/* COLONNE GAUCHE : COMPOSITION ANIMÉE D'IMAGES (TRANSITION SCROLL & CASCADE) */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, x: -40, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 relative flex items-center justify-center min-h-[400px] sm:min-h-[480px] [perspective:1200px]"
          >
            {/* Dotted Grid Pattern Background Overlay */}
            <div className="absolute top-2 left-2 w-48 h-48 bg-[radial-gradient(#100906_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-15 pointer-events-none rounded-2xl" />

            <AnimatePresence mode="wait">
              <div
                key={activeIndex}
                className="relative w-full max-w-[480px] h-[380px] sm:h-[440px] flex items-center justify-center"
              >
                {/* 1. Image principale squircle (Fondation - arrive en 1er) */}
                <motion.div
                  initial={{ opacity: 0, y: 60, scale: 0.85, rotate: -4 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, y: -25, scale: 0.9 }}
                  transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-0 left-0 w-[62%] h-[68%] rounded-[2.2rem] overflow-hidden border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-10"
                >
                  <img
                    src={currentVisual.mainImg}
                    alt={activePillar.title || "Pilier NFL"}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </motion.div>

                {/* 2. Deuxième image squircle (S'empile en haut à droite en 2ème) */}
                <motion.div
                  initial={{ opacity: 0, y: 70, x: 25, scale: 0.8, rotate: 6 }}
                  animate={{ opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.85 }}
                  transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-[8%] right-0 w-[42%] h-[45%] rounded-[1.8rem] overflow-hidden border-4 border-white shadow-[0_15px_35px_rgba(0,0,0,0.1)] z-0"
                >
                  <img
                    src={currentVisual.subImg1}
                    alt={activePillar.title || "Visual 2"}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* 3. Troisième image squircle (S'empile en bas à droite en 3ème) */}
                <motion.div
                  initial={{ opacity: 0, y: 80, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, y: -15, scale: 0.85 }}
                  transition={{ duration: 0.45, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-0 right-[4%] w-[52%] h-[50%] rounded-[2rem] overflow-hidden border-4 border-white shadow-[0_20px_45px_rgba(0,0,0,0.12)] z-10"
                >
                  <img
                    src={currentVisual.subImg2}
                    alt={activePillar.title || "Visual 3"}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* 4. CARTE SQUIRCLE DE STATS (S'empile au sommet en 4ème) */}
                <motion.div
                  initial={{ opacity: 0, y: 90, scale: 0.75, rotate: 5 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, y: -10, scale: 0.8 }}
                  transition={{ duration: 0.45, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-[4%] left-[2%] w-[42%] h-[38%] rounded-[1.8rem] bg-gradient-to-br from-[#100906] via-[#1f120c] to-[#3a2012] text-white p-5 flex flex-col justify-between border-2 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-20"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center">
                    <BadgeIcon className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#e3bd51]">
                      {currentVisual.statNumber}
                    </span>
                    <p className="text-white/80 text-xs sm:text-sm font-medium leading-tight mt-0.5">
                      {currentVisual.statLabel}
                    </p>
                  </div>
                </motion.div>
              </div>
            </AnimatePresence>
          </motion.div>

          {/* ========================================================================= */}
          {/* COLONNE DROITE : CARTE STYLE RÉFÉRENCE (SATIN SILVER CARD & DARK PILL TABS) */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6"
          >
            <div className="bg-gradient-to-br from-[#f8f6f0] via-[#f1eee6] to-[#e6e1d4] rounded-[2.5rem] p-7 sm:p-10 border border-[#d8d3c5] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)] relative flex flex-col justify-between min-h-[440px]">
              
              {/* Contenu supérieur : Barre d'onglets + Titre & Description */}
              <div>
                {/* Barre d'onglets — compacts sur mobile pour tenir sans scroll horizontal, taille normale dès sm */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap sm:overflow-x-auto pb-1 sm:pb-2 scrollbar-none">
                  {pillars.map((pillar, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`relative px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-base font-semibold transition-all duration-300 whitespace-nowrap shrink-0 ${
                          isActive
                            ? "bg-[#121212] text-white shadow-md"
                            : "text-[#444] hover:text-[#121212] hover:bg-black/5"
                        }`}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <EditableText
                            value={pillar.title || `Pilier ${idx + 1}`}
                            onSave={(v) => onSaveItemField(idx, "title", v)}
                            label="Titre"
                          />
                        </span>
                      </button>
                    );
                  })}

                  {isEditMode && (
                    <button
                      onClick={onAddPillar}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase text-[#8c591a] hover:bg-[#8c591a]/10 shrink-0"
                    >
                      + Ajouter
                    </button>
                  )}
                </div>

                {/* Animation de contenu lors du changement d'onglet */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mt-8 space-y-4"
                  >
                    {isEditMode && pillars.length > 1 && (
                      <div className="absolute top-4 right-4 z-30">
                        <RemoveItemButton onClick={() => onRemovePillar(activeIndex)} label="Retirer ce pilier" />
                      </div>
                    )}

                    {/* Grand Titre style "Stay Connected. Stay..." */}
                    <h3 className="font-sans text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-[#121212] tracking-tight leading-[1.15]">
                      <EditableText
                        value={activePillar.title || `Pilier ${activeIndex + 1}`}
                        onSave={(v) => onSaveItemField(activeIndex, "title", v)}
                        label="Titre du pilier"
                      />
                    </h3>

                    {/* Description fluide et claire */}
                    <p className="text-[#333]/80 text-base sm:text-lg leading-relaxed font-normal max-w-xl">
                      <EditableText
                        value={activePillar.description || "Description complète de ce pilier d'accompagnement..."}
                        onSave={(v) => onSaveItemField(activeIndex, "description", v)}
                        label="Description"
                        multiline
                        as="div"
                      />
                    </p>

                    {/* Points clés */}
                    <div className="pt-2">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {currentVisual.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-center gap-2.5 text-sm text-[#222] font-medium">
                            <CheckCircle2 className="w-4 h-4 text-[#8c591a] shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bas de la carte : Pagination à 3 points (Left) + Bouton CTA (Right) */}
              <div className="mt-10 pt-4 flex items-center justify-between border-t border-black/5">
                {/* Dots indicator à la position exacte du screenshot de l'utilisateur */}
                <div className="flex items-center gap-2.5">
                  {pillars.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Aller au pilier ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full ${
                        idx === activeIndex
                          ? "w-3 h-3 bg-[#121212]"
                          : "w-2.5 h-2.5 bg-black/20 hover:bg-black/40"
                      }`}
                    />
                  ))}
                </div>

                {/* Bouton d'action / CTA */}
                <div>
                  {isEditMode ? (
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8c591a]">
                      <EditableText
                        value={activePillar.ctaText || "En savoir plus"}
                        onSave={(v) => onSaveItemField(activeIndex, "ctaText", v)}
                        label="Texte du bouton"
                      />
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <Link
                      to={activePillar.link || "/catalogue-formations"}
                      className="inline-flex items-center gap-2 sm:gap-3 bg-[#121212] hover:bg-[#252525] text-white rounded-full px-3.5 py-2 sm:px-6 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105 active:scale-95 group"
                    >
                      <span>{activePillar.ctaText || "Découvrir"}</span>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 group-hover:bg-[#d4af37] group-hover:text-black transition-colors duration-300 flex items-center justify-center shrink-0">
                        <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </div>
                    </Link>
                  )}
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ExpertisePillarsSection;
