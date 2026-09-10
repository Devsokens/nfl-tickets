import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Event } from "@/lib/api";
import HighlightEventCard from "@/components/HighlightEventCard";

interface EventsCarouselProps {
  events: Event[];
  isEditMode?: boolean;
}

export const EventsCarousel = ({ events }: EventsCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0); // ref toujours à jour pour l'interval
  const totalCards = events.length + 1;

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const card = container.children[index] as HTMLElement;
    if (card) {
      container.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    }
  };

  // ── Auto-scroll stable — utilise la ref pour éviter la closure périmée ──
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeIndexRef.current + 1) % totalCards;
      activeIndexRef.current = next;
      setActiveIndex(next);
      scrollToIndex(next);
    }, 3200);
    return () => clearInterval(timer);
  }, [totalCards]); // se relance uniquement si le nombre de cartes change

  const handleDotClick = (idx: number) => {
    activeIndexRef.current = idx;
    setActiveIndex(idx);
    scrollToIndex(idx);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = (container.firstElementChild as HTMLElement)?.offsetWidth || 240;
    const newIndex = Math.round(container.scrollLeft / (cardWidth + 16));
    if (newIndex >= 0 && newIndex < totalCards && newIndex !== activeIndexRef.current) {
      activeIndexRef.current = newIndex;
      setActiveIndex(newIndex);
    }
  };

  const scrollLeft = () => {
    const prev = (activeIndexRef.current - 1 + totalCards) % totalCards;
    activeIndexRef.current = prev;
    setActiveIndex(prev);
    scrollToIndex(prev);
  };

  const scrollRight = () => {
    const next = (activeIndexRef.current + 1) % totalCards;
    activeIndexRef.current = next;
    setActiveIndex(next);
    scrollToIndex(next);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

        {/* ── GAUCHE : TITRE + TEXTE + NAVIGATION ── */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-4">

          {/* Eyebrow — identique aux autres sections */}
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8c591a]">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            Agenda de prestige
          </span>

          {/* H2 — identique aux autres sections */}
          <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#100906]">
            Nos événements d'élite
          </h2>

          <p className="text-black/65 text-sm sm:text-base leading-relaxed font-normal max-w-xs">
            Séminaires de prestige, masterclasses privées et conférences d'exception pour les dirigeants au Gabon.
          </p>

          {/* ── DOTS + BOUTONS — en bas de la colonne ── */}
          <div className="mt-auto pt-6 flex flex-col gap-4">

            {/* Dots */}
            <div className="flex items-center gap-2 flex-wrap">
              {Array.from({ length: totalCards }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  aria-label={`Carte ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    idx === activeIndex
                      ? "w-5 h-2.5 bg-[#100906]"
                      : "w-2.5 h-2.5 bg-black/25 hover:bg-black/45"
                  }`}
                />
              ))}
            </div>

            {/* Boutons navigation flèches — en dessous des dots */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={scrollLeft}
                aria-label="Précédent"
                className="w-10 h-10 rounded-full border border-black/20 text-black flex items-center justify-center hover:bg-[#100906] hover:text-white hover:border-[#100906] transition-all shadow-sm active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                aria-label="Suivant"
                className="w-10 h-10 rounded-full bg-[#100906] text-white flex items-center justify-center hover:bg-[#d4af37] hover:text-black transition-all shadow-md active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* ── DROITE : SLIDER SANS CLIPPING ── */}
        {/* 
          Clé du fix : on n'applique PAS overflow-hidden sur le conteneur parent.
          Le scroll se fait sur l'élément lui-même, qui déborde naturellement vers la droite.
          Le parent a juste min-w-0 pour que le flex fonctionne correctement.
        */}
        <div className="w-full lg:flex-1 lg:min-w-0">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {events.map((event) => (
              <div
                key={event.id}
                className="w-[220px] sm:w-[245px] lg:w-[260px] shrink-0 snap-start"
              >
                <HighlightEventCard event={event} />
              </div>
            ))}

            {/* CARTE "VOIR TOUS" */}
            <div className="w-[220px] sm:w-[245px] lg:w-[260px] shrink-0 snap-start">
              <Link
                to="/events"
                className="group bg-gradient-to-br from-[#100906] via-[#1f120c] to-[#3a2012] text-white rounded-2xl border border-white/10 p-4 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="relative w-full h-32 sm:h-36 rounded-xl bg-white/10 border border-white/10 flex flex-col items-center justify-center p-4 text-center mb-4 overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="px-0.5">
                    <h3 className="font-sans text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors line-clamp-2 leading-snug mb-1.5">
                      Voir tous les événements
                    </h3>
                    <p className="text-white/60 text-[11px] leading-relaxed line-clamp-2 mb-3 font-normal">
                      Explorez notre agenda complet de séminaires, masterclasses et galas.
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/10 mt-auto">
                  <div className="w-full bg-[#d4af37] group-hover:bg-white text-black font-bold rounded-full py-2 px-3 text-[10px] uppercase tracking-wider transition-colors duration-300 flex items-center justify-center gap-1.5 shadow-sm">
                    <span>Découvrir l'agenda</span>
                    <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EventsCarousel;
