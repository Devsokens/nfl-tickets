import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Award, Target, CheckCircle2 } from "lucide-react";

export interface StackCardData {
  id: number;
  number: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CARDS: StackCardData[] = [
  {
    id: 1,
    number: "1",
    badge: "Accréditation & Normes",
    title: "Modules de formation certifiants",
    description:
      "Des programmes certifiés conformes aux exigences professionnelles les plus strictes, garantissant une valorisation immédiate et pérenne de vos compétences sur le marché de l'emploi et des affaires.",
    icon: Award,
  },
  {
    id: 2,
    number: "2",
    badge: "Méthodologie Immersive",
    title: "Approche pratique axée résultats",
    description:
      "Études de cas réels d'entreprise, ateliers interactifs et méthodologies concrètes directement exploitables pour générer un retour sur investissement tangible au sein de vos équipes.",
    icon: Target,
  },
  {
    id: 3,
    number: "3",
    badge: "Progression Mesurée",
    title: "Évaluation continue des compétences",
    description:
      "Un dispositif d'évaluation continue, feedbacks réguliers dispensés par des formateurs certifiés et accompagnement sur-mesure pour ancrer durablement la maîtrise opérationnelle.",
    icon: CheckCircle2,
  },
];

const CARD_INTERVAL_MS = 6000;

interface FormationStackCardsProps {
  className?: string;
}

export const FormationStackCards: React.FC<FormationStackCardsProps> = ({ className = "" }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  // Auto-cycle every 6 seconds as requested
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARDS.length);
    }, CARD_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`relative w-full max-w-[540px] mx-auto select-none ${className}`}>
      {/* Decorative Golden Ambient Glow behind the deck */}
      <div className="absolute -inset-6 bg-gradient-to-tr from-[#d4af37]/25 via-[#8c591a]/15 to-transparent rounded-[3rem] blur-3xl pointer-events-none" />

      {/* Main Stack Container: offsets white cards to bottom-right like the reference image */}
      <div className="relative h-[340px] sm:h-[370px] lg:h-[390px] w-full pr-10 sm:pr-14 pb-12 sm:pb-16">
        {CARDS.map((card, index) => {
          // Calculate relative position in the stack (0: front, 1: middle, 2: back)
          const relPos = (index - activeIndex + CARDS.length) % CARDS.length;
          const isActive = relPos === 0;
          const Icon = card.icon;

          // Responsive offsets: peeking to the bottom-right like the reference image
          const offsetX = relPos * 26;
          const offsetY = relPos * 34;
          const scale = 1 - relPos * 0.045;
          const zIndex = 30 - relPos * 10;
          const opacity = relPos === 0 ? 1 : relPos === 1 ? 0.95 : 0.85;

          return (
            <motion.div
              key={card.id}
              layout
              initial={false}
              animate={{
                x: offsetX,
                y: offsetY,
                scale,
                zIndex,
                opacity,
              }}
              transition={{
                duration: 0.7,
                ease: [0.25, 1, 0.35, 1], // luxury smooth cubic curve
              }}
              onClick={() => setActiveIndex(index)}
              className={`absolute top-0 left-0 w-[calc(100%-52px)] sm:w-[calc(100%-60px)] min-h-[290px] sm:min-h-[320px] rounded-3xl cursor-pointer transition-colors duration-300 overflow-hidden ${
                isActive
                  ? "bg-white text-[#100906] border border-white shadow-[0_25px_60px_rgba(0,0,0,0.65),0_0_35px_rgba(212,175,55,0.25)]"
                  : relPos === 1
                  ? "bg-white/95 text-[#100906] border border-white/80 shadow-[0_18px_45px_rgba(0,0,0,0.55)] backdrop-blur-md hover:bg-white"
                  : "bg-white/90 text-[#100906] border border-white/60 shadow-[0_12px_30px_rgba(0,0,0,0.45)] backdrop-blur-md hover:bg-white/95"
              }`}
              style={{
                transformOrigin: "top left",
              }}
            >
              {/* Subtle top gloss line */}
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent pointer-events-none" />

              {/* Large Stylized Number in top-right (matches reference image) */}
              <span
                className={`absolute top-3 right-5 sm:right-7 font-serif font-black text-7xl sm:text-8xl leading-none select-none pointer-events-none transition-opacity duration-300 ${
                  isActive ? "text-[#d4af37]/35" : "text-black/10"
                }`}
              >
                {card.number}
              </span>

              {/* Card Inner Content */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-full relative z-10">
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center gap-3 mb-4 sm:mb-5">
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-gradient-to-br from-[#d4af37] to-[#b8932b] text-[#100906] shadow-md shadow-[#d4af37]/35"
                          : "bg-black/5 border border-black/10 text-[#8c591a]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs sm:text-[13px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
                        isActive
                          ? "bg-[#d4af37]/20 border-[#d4af37]/50 text-[#8c591a]"
                          : "bg-black/5 border-black/10 text-black/60"
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3
                    className={`font-sans font-extrabold text-lg sm:text-2xl lg:text-2xl leading-tight tracking-tight mb-3 pr-12 transition-colors ${
                      isActive ? "text-[#100906]" : "text-[#100906]/85"
                    }`}
                  >
                    {card.title}
                  </h3>

                  {/* Card Description */}
                  <p
                    className={`text-sm sm:text-[15px] leading-relaxed transition-colors ${
                      isActive ? "text-[#444] font-normal" : "text-[#666] font-light"
                    }`}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FormationStackCards;
