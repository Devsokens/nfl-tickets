import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Linkedin, MapPin } from "lucide-react";
import type { Event } from "@/lib/api";
import HighlightEventCard from "@/components/HighlightEventCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditableText } from "@/components/admin/editable/EditableText";

type IntroField = "eyebrow" | "title" | "subtitle";

interface EventsCarouselProps {
  events: Event[];
  intro: Partial<Record<IntroField, string>>;
  onSaveIntroField: (field: IntroField, value: string) => Promise<void>;
}

// Les dates d'événement sont des jours ("2025-03-15", lus en UTC) : on les
// formate en UTC pour ne jamais décaler d'un jour selon le fuseau du visiteur.
function formatEventDate(event: Event) {
  const d = new Date(event.date);
  if (isNaN(d.getTime())) return "";
  const day = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return event.time ? `${day} · ${event.time.slice(0, 5).replace(":", "h")}` : day;
}

const EventSummaryDialog = ({ event, onClose }: { event: Event | null; onClose: () => void }) => {
  const image = event?.image_url || event?.image;
  const isPast = event ? new Date(event.date) < new Date(new Date().setHours(0, 0, 0, 0)) : false;

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden overflow-y-auto max-h-[90vh] bg-gradient-to-br from-[#100906] via-[#1f120c] to-[#3a2012] text-white border-white/10 rounded-[1.75rem] sm:rounded-[1.75rem]">
        {event && (
          <>
            {image && (
              <div className="relative w-full h-48 sm:h-56 bg-black/40">
                <img src={image} alt={event.title} className="w-full h-full object-cover" />
                <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${isPast ? "text-black bg-white/90" : "text-black bg-[#d4af37]"}`}>
                  {isPast ? "Terminé" : "À venir"}
                </span>
              </div>
            )}

            <div className="p-6 sm:p-7 space-y-4">
              <DialogHeader className="text-left space-y-2">
                <DialogTitle className="font-sans text-xl sm:text-2xl font-bold text-white leading-snug pr-6">
                  {event.title}
                </DialogTitle>
                <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-white/80 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                    {formatEventDate(event)}
                  </span>
                  {event.location && (
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                      {event.location}
                    </span>
                  )}
                </div>
              </DialogHeader>

              <DialogDescription className="text-white/75 text-sm leading-relaxed whitespace-pre-line">
                {event.description || "Résumé de l'événement à venir."}
              </DialogDescription>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                {event.linkedin_url && (
                  <a
                    href={event.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-white text-black font-bold rounded-full py-2.5 px-4 text-xs uppercase tracking-wider transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    Voir le post LinkedIn
                  </a>
                )}
                <Link
                  to={`/event/${event.slug || event.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white font-bold rounded-full py-2.5 px-4 text-xs uppercase tracking-wider transition-colors"
                >
                  Voir le détail
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const EventsCarousel = ({ events, intro, onSaveIntroField }: EventsCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
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
            <EditableText value={intro.eyebrow || ""} onSave={(v) => onSaveIntroField("eyebrow", v)} label="Surtitre" />
          </span>

          {/* H2 — identique aux autres sections */}
          <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#100906]">
            <EditableText value={intro.title || ""} onSave={(v) => onSaveIntroField("title", v)} label="Titre" />
          </h2>

          <p className="text-black/65 text-sm sm:text-base leading-relaxed font-normal max-w-xs">
            <EditableText value={intro.subtitle || ""} onSave={(v) => onSaveIntroField("subtitle", v)} label="Sous-titre" multiline as="span" />
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
                <HighlightEventCard event={event} onOpen={() => setSelectedEvent(event)} />
              </div>
            ))}

            {/* CARTE "TOUS NOS ÉVÉNEMENTS" → page liste /events */}
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
                      Tous nos événements
                    </h3>
                    <p className="text-white/60 text-[11px] leading-relaxed line-clamp-2 mb-3 font-normal">
                      Retrouvez l'ensemble de nos séminaires, masterclasses et conférences.
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/10 mt-auto">
                  <div className="w-full bg-[#d4af37] group-hover:bg-white text-black font-bold rounded-full py-2 px-3 text-[10px] uppercase tracking-wider transition-colors duration-300 flex items-center justify-center gap-1.5 shadow-sm">
                    <span>Voir tous les événements</span>
                    <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </div>

      </div>

      <EventSummaryDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};

export default EventsCarousel;
