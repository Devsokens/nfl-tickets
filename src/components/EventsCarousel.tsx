import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Event } from "@/lib/api";
import HighlightEventCard from "@/components/HighlightEventCard";

interface EventsCarouselProps {
  events: Event[];
  isEditMode?: boolean;
}

export const EventsCarousel = ({ events, isEditMode }: EventsCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalCards = Math.min(events.length, 3) + 1; // 3 events + 1 "Voir tous" card = 4 cards total

  // Autonomous auto-scrolling on mobile/tablet every 3.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % totalCards;
        scrollToIndex(next);
        return next;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [totalCards]);

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardNode = container.children[index] as HTMLElement;
    if (cardNode) {
      container.scrollTo({
        left: cardNode.offsetLeft - 16,
        behavior: "smooth",
      });
    }
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    scrollToIndex(index);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.firstElementChild?.clientWidth || 280;
    const newIndex = Math.round(scrollPosition / (cardWidth + 16));
    if (newIndex >= 0 && newIndex < totalCards && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="w-full">
      {/* DESKTOP VIEW: CLEAN 4-COLUMN GRID */}
      <div className="hidden lg:grid lg:grid-cols-4 lg:gap-6">
        {events.slice(0, 3).map((event) => (
          <div key={event.id} className="h-full">
            <HighlightEventCard event={event} />
          </div>
        ))}

        {/* 4TH CARD: VOIR TOUS LES ÉVÉNEMENTS (MEME TAILLE & STRUCTURE EXACTE QUE LES CARTES D'ÉVÉNEMENTS) */}
        <div className="h-full">
          <Link
            to="/events"
            className="group bg-gradient-to-br from-[#100906] via-[#1f120c] to-[#3a2012] text-white rounded-[2rem] border border-black/10 p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              {/* COMPARTIMENT HAUT (MÊME HAUTEUR QUE L'IMAGE DES CARTES: h-48 sm:h-52) */}
              <div className="relative w-full h-48 sm:h-52 rounded-[1.5rem] bg-white/10 border border-white/10 flex flex-col items-center justify-center p-4 text-center mb-6 overflow-hidden">
                <div className="w-14 h-14 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>

              {/* TITRE ET DESCRIPTION */}
              <div className="pt-1 px-1">
                <h3 className="font-sans text-lg sm:text-xl font-bold text-white group-hover:text-[#d4af37] transition-colors line-clamp-2 leading-snug mb-2">
                  Voir tous les événements
                </h3>
                <p className="text-white/70 text-xs leading-relaxed line-clamp-2 mb-4 font-normal">
                  Explorez notre agenda complet de séminaires, masterclasses et formations.
                </p>
              </div>
            </div>

            {/* BOUTON DU BAS (MÊME STRUCTURE QUE "VOIR DÉTAIL") */}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-3 px-1 mt-auto">
              <div className="w-full bg-[#d4af37] group-hover:bg-white text-black font-bold rounded-full py-2.5 px-4 text-xs uppercase tracking-wider transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm">
                <span>Découvrir l'agenda</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* MOBILE / TABLET VIEW: AUTONOMOUS LINEAR SCROLLER WITH DOTS */}
      <div className="block lg:hidden">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-none -mx-4 px-4"
        >
          {events.slice(0, 3).map((event) => (
            <div key={event.id} className="w-[82vw] max-w-[320px] shrink-0 snap-center h-full">
              <HighlightEventCard event={event} />
            </div>
          ))}

          {/* 4TH CARD ON MOBILE (MÊME TAILLE ET STRUCTURE) */}
          <div className="w-[82vw] max-w-[320px] shrink-0 snap-center h-full">
            <Link
              to="/events"
              className="group bg-gradient-to-br from-[#100906] via-[#1f120c] to-[#3a2012] text-white rounded-[2rem] border border-black/10 p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="relative w-full h-48 sm:h-52 rounded-[1.5rem] bg-white/10 border border-white/10 flex flex-col items-center justify-center p-4 text-center mb-6 overflow-hidden">
                  <div className="w-14 h-14 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center shadow-md">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>

                <div className="pt-1 px-1">
                  <h3 className="font-sans text-lg sm:text-xl font-bold text-white leading-snug mb-2">
                    Voir tous les événements
                  </h3>
                  <p className="text-white/70 text-xs leading-relaxed line-clamp-2 mb-4 font-normal">
                    Explorez notre agenda complet de séminaires et masterclasses.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-col gap-3 px-1 mt-auto">
                <div className="w-full bg-[#d4af37] text-black font-bold rounded-full py-2.5 px-4 text-xs uppercase tracking-wider text-center shadow-sm">
                  Découvrir l'agenda
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* DOTS INDICATOR (POINTS RONDS UNIQUEMENT SANS BARRE) */}
        <div className="flex items-center justify-center gap-2.5 mt-4 pt-2">
          {Array.from({ length: totalCards }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              aria-label={`Aller à la carte ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                idx === activeIndex
                  ? "w-3 h-3 bg-[#100906]"
                  : "w-2.5 h-2.5 bg-black/20 hover:bg-black/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsCarousel;
