import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Menu } from "lucide-react";
import { EditableText } from "@/components/admin/editable/EditableText";
import { useIsEditMode } from "@/lib/EditModeContext";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Assets locaux de NFL
import nflLogoMark from "@/assets/Logo_NFL_fond_blanc-removebg-preview.png";
import heroImage3 from "@/assets/louise2.jpeg";
import nflGroupPhoto from "@/assets/nfl img3.jpeg";
import louisePortrait from "@/assets/louise photo.jpeg";

interface GrevyHeroSectionProps {
  content: {
    badge?: string;
    titleLine1?: string;
    titleLine2?: string;
    subtitle?: string;
    ctaPrimaryText?: string;
    ctaPrimaryLink?: string;
    ctaSecondaryText?: string;
    ctaSecondaryLink?: string;
    badgeCardTitle?: string;
    badgeCardSubtitle?: string;
  };
  onSaveField: (field: string, value: string) => Promise<void>;
}

// Photos d'événements NFL réels pour le collage de squircles (6 images distinctes, sans répétition)
const AVATARS = [
  {
    id: 1,
    url: "/assets/nfl-image-1.jpeg",
    alt: "Panel NFL — intervenants en conférence",
  },
  {
    id: 2,
    url: "/assets/nfl-image-2.jpeg",
    alt: "Participante lors d'un événement NFL",
  },
  {
    id: 3,
    url: "/assets/nfl-image-3.jpeg",
    alt: "Participant lors d'un événement NFL",
  },
  {
    id: 4,
    url: "/assets/nfl4.jpeg",
    alt: "Panel NFL — échange en conférence",
  },
  {
    id: 5,
    url: nflGroupPhoto,
    alt: "Participantes lors d'un séminaire NFL",
  },
  {
    id: 6,
    url: louisePortrait,
    alt: "Louise-Audyll Ongoum, fondatrice de NFL",
  },
];

export const GrevyHeroSection = ({ content, onSaveField }: GrevyHeroSectionProps) => {
  const isEditMode = useIsEditMode();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("accueil");

  const guardNav = (path: string, fallback?: () => void) => (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      return;
    }
    if (fallback) {
      fallback();
    } else {
      navigate(path);
    }
  };

  return (
    <section className="relative w-full lg:h-screen lg:max-h-screen overflow-hidden bg-[#100906] text-white flex flex-col justify-between pt-20 sm:pt-24 lg:pt-24 pb-6 lg:pb-8 px-4 sm:px-6 lg:px-10 font-sans selection:bg-[#d4af37] selection:text-black">
      {/* 1. ARRIÈRE-PLAN GRADIENT MESH DYNAMIQUE (COULEURS NFL: BRUN, OR, AMBRE, TERRACOTTA) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Mesh Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[65vw] h-[65vw] max-w-[750px] max-h-[750px] rounded-full bg-gradient-to-br from-[#8a4216] via-[#d4af37]/35 to-transparent blur-[140px] opacity-75 animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[70vw] h-[70vw] max-w-[850px] max-h-[850px] rounded-full bg-gradient-to-tl from-[#54210a] via-[#8c4b1a]/45 to-transparent blur-[160px] opacity-80" />
        <div className="absolute top-[30%] left-[22%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-[#d4af37]/20 blur-[130px] pointer-events-none" />
        {/* Fine Noise overlay for high-end realistic texture */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
      </div>

      {/* 2. HERO CONTENT GRID (FIT 100VH VIEWPORT) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto my-auto py-2 sm:py-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
        
        {/* --- COLONNE GAUCHE: TEXTE & CTAS --- */}
        <motion.div
          className="lg:col-span-6 space-y-4 sm:space-y-5 text-left"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Grand Titre Typographique (Fraunces Serif) : 2 Lignes L'Excellence au service de vos ambitions + 1 Ligne Accent */}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-white leading-[1.08] text-balance">
            <span className="block">
              <EditableText
                value={content.titleLine1 || "L'Excellence au service"}
                onSave={(v) => onSaveField("titleLine1", v)}
                label="Titre ligne 1"
                multiline
              />
            </span>
            <span className="block mt-0.5">
              <EditableText
                value={content.titleLine2 || "de vos ambitions"}
                onSave={(v) => onSaveField("titleLine2", v)}
                label="Titre ligne 2"
                multiline
              />
            </span>
            <span className="block italic text-[#e3bd51] mt-1.5 font-normal">
              <EditableText
                value={content.ctaSecondaryText || "& le Prestige Événementiel"}
                onSave={(v) => onSaveField("ctaSecondaryText", v)}
                label="Titre ligne 3 (accent)"
                multiline
              />
            </span>
          </h1>

          {/* Description & Corps de texte */}
          <div className="text-white/80 text-sm sm:text-base max-w-lg font-light leading-relaxed">
            <EditableText
              value={
                content.subtitle ||
                "Nous accompagnons les entreprises, institutions, dirigeants et personnels dans leurs projets les plus ambitieux grâce à une expertise reconnue et une satisfaction client au cœur de notre activité."
              }
              onSave={(v) => onSaveField("subtitle", v)}
              label="Sous-titre"
              multiline
              as="div"
            />
          </div>

          {/* Bouton CTA Pilule Verre dépoli style Grevy */}
          <div className="pt-1 flex items-center gap-4">
            <Button
              onClick={isEditMode ? undefined : () => navigate(content.ctaPrimaryLink || "/catalogue-formations")}
              className="group relative h-12 sm:h-14 px-7 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/30 text-white font-semibold text-xs sm:text-sm transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 flex items-center gap-3.5"
            >
              <span>
                {isEditMode ? (
                  <EditableText
                    value={content.ctaPrimaryText || "Découvrir nos services"}
                    onSave={(v) => onSaveField("ctaPrimaryText", v)}
                    label="Bouton principal"
                  />
                ) : (
                  content.ctaPrimaryText || "Découvrir nos services"
                )}
              </span>
              <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-[#d4af37] group-hover:text-black transition-colors duration-300 flex items-center justify-center border border-white/30 shrink-0">
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Button>
          </div>
        </motion.div>

        {/* --- COLONNE DROITE: DISPOSITION DES SQUIRCLES EN ESCALIER (STAIRCASE - CARTE AGRANDIES) --- */}
        <motion.div
          className="lg:col-span-6 relative flex items-center justify-center min-h-[420px] sm:min-h-[480px]"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {/* SQUIRCLE GRID IN ESCALIER — animation "vague" en bloc :
              chaque carte ondule verticalement avec un décalage de phase suivant
              sa position, créant une onde qui traverse la cascade en diagonale. */}
          <div className="relative w-full max-w-[540px] h-[380px] sm:h-[440px] mx-auto lg:mr-0">

            {/* MARCHE 1 (HAUT DROITE) */}
            <motion.div
              className="absolute top-[0%] left-[68%] w-24 h-24 sm:w-32 sm:h-32 rounded-[2.2rem] overflow-hidden border-2 border-white/30 shadow-2xl bg-[#2a221e] hover:z-30"
              style={{ x: "-50%" }}
              whileHover={{ scale: 1.08 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
            >
              <img src={AVATARS[0].url} alt={AVATARS[0].alt} className="w-full h-full object-cover" />
            </motion.div>

            {/* MARCHE 2 (HAUT MILIEU & EXTRÊME DROITE) */}
            <motion.div
              className="absolute top-[22%] left-[44%] w-24 h-24 sm:w-32 sm:h-32 rounded-[2.2rem] overflow-hidden border-2 border-white/30 shadow-2xl bg-[#7a482b] hover:z-30"
              style={{ x: "-50%" }}
              whileHover={{ scale: 1.08 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            >
              <img src={AVATARS[1].url} alt={AVATARS[1].alt} className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className="absolute top-[18%] left-[88%] w-24 h-24 sm:w-32 sm:h-32 rounded-[2.2rem] overflow-hidden border-2 border-white/30 shadow-xl bg-[#553b26] hover:z-30"
              style={{ x: "-50%" }}
              whileHover={{ scale: 1.08 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
            >
              <img src={AVATARS[5].url} alt={AVATARS[5].alt} className="w-full h-full object-cover" />
            </motion.div>

            {/* MARCHE 3 (MILIEU - BADGE SQUIRCLE LOGO NFL CENTRAL + AVATAR DROITE) */}
            <motion.div
              className="absolute top-[44%] left-[22%] w-24 h-24 sm:w-32 sm:h-32 rounded-[2.2rem] bg-white flex items-center justify-center p-3.5 border-2 border-white shadow-[0_25px_60px_rgba(0,0,0,0.6)] z-20"
              style={{ x: "-50%" }}
              whileHover={{ scale: 1.08 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            >
              <img src={nflLogoMark} alt="NFL Mark" className="w-full h-full object-contain filter drop-shadow-md" />
            </motion.div>
            <motion.div
              className="absolute top-[44%] left-[62%] w-24 h-24 sm:w-32 sm:h-32 rounded-[2.2rem] overflow-hidden border-2 border-white/30 shadow-2xl bg-[#d4af37] hover:z-30"
              style={{ x: "-50%" }}
              whileHover={{ scale: 1.08 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.45 }}
            >
              <img src={AVATARS[2].url} alt={AVATARS[2].alt} className="w-full h-full object-cover" />
            </motion.div>

            {/* MARCHE 4 (BAS GAUCHE & BAS MILIEU) */}
            <motion.div
              className="absolute top-[66%] left-[0%] w-24 h-24 sm:w-32 sm:h-32 rounded-[2.2rem] overflow-hidden border-2 border-white/30 shadow-2xl bg-[#438a5e] hover:z-30"
              whileHover={{ scale: 1.08 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.75 }}
            >
              <img src={AVATARS[3].url} alt={AVATARS[3].alt} className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className="absolute top-[66%] left-[40%] w-24 h-24 sm:w-32 sm:h-32 rounded-[2.2rem] overflow-hidden border-2 border-white/30 shadow-2xl bg-[#336688] hover:z-30"
              style={{ x: "-50%" }}
              whileHover={{ scale: 1.08 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            >
              <img src={AVATARS[4].url} alt={AVATARS[4].alt} className="w-full h-full object-cover" />
            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default GrevyHeroSection;
