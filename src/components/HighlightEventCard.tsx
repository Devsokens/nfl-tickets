import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import type { Event } from "@/lib/api";

const MONTHS_FR = ["JANV", "FÉVR", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];

function getParsedDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { day: "18", month: "MARS", year: "2026" };
  return {
    day: d.getDate().toString().padStart(2, "0"),
    month: MONTHS_FR[d.getMonth()],
    year: d.getFullYear().toString(),
  };
}

interface HighlightEventCardProps {
  event: Event;
}

const HighlightEventCard = ({ event }: HighlightEventCardProps) => {
  const image = event.image_url || event.image;
  const isPast = new Date(event.date) < new Date(new Date().setHours(0, 0, 0, 0));
  const { day, month } = getParsedDate(event.date);

  return (
    <Link
      to={`/event/${event.slug || event.id}`}
      className="group bg-gradient-to-br from-[#100906] via-[#1f120c] to-[#3a2012] text-white rounded-2xl sm:rounded-[2rem] border border-white/10 p-2.5 sm:p-5 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-28 sm:w-36 h-28 sm:h-36 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* IMAGE CONTAINER WITH CIRCULAR DATE BADGE */}
        <div className="relative w-full h-32 sm:h-52 rounded-xl sm:rounded-[1.5rem] overflow-hidden mb-4 sm:mb-6 bg-black/40">
          {image ? (
            <img
              src={image}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-[#100906] flex items-center justify-center text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider p-2 text-center">
              {event.title}
            </div>
          )}

          {/* STATUS BADGE TOP-RIGHT */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
            {isPast ? (
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-black bg-white/90 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm">
                Terminé
              </span>
            ) : (
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-black bg-[#d4af37] backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm border border-[#d4af37]/40 font-extrabold">
                À venir
              </span>
            )}
          </div>

          {/* CIRCULAR DATE BADGE */}
          <div className="absolute bottom-[-10px] left-2 sm:bottom-[-14px] sm:left-4 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#100906] text-white border-2 border-[#d4af37] flex flex-col items-center justify-center text-center shadow-lg z-20 shrink-0">
            <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-wider text-[#d4af37] leading-none">
              {month}
            </span>
            <span className="text-[10px] sm:text-sm font-extrabold text-white leading-tight">
              {day}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="pt-1 px-0.5 sm:px-1">
          <h3 className="font-sans text-xs sm:text-xl font-bold text-white group-hover:text-[#d4af37] transition-colors line-clamp-2 leading-snug mb-1 sm:mb-2">
            {event.title}
          </h3>

          <p className="text-white/70 text-[10px] sm:text-xs leading-relaxed line-clamp-2 mb-2 sm:mb-4 font-normal">
            {event.description || "Rejoignez-nous pour cet événement d'exception organisé par NFL Courtier & Service."}
          </p>
        </div>
      </div>

      {/* FOOTER ROW & VOIR DÉTAIL BUTTON */}
      <div className="pt-2 sm:pt-3 border-t border-white/10 flex flex-col gap-2 sm:gap-3 px-0.5 sm:px-1 mt-auto">
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-white/80 font-medium truncate">
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d4af37] shrink-0" />
          <span className="truncate">{event.location || "Libreville, Gabon"}</span>
        </div>

        {/* BUTTON VOIR DÉTAIL */}
        <div className="w-full bg-[#d4af37] group-hover:bg-white text-black font-bold rounded-full py-1.5 sm:py-2.5 px-2 sm:px-4 text-[9px] sm:text-xs uppercase tracking-wider transition-colors duration-300 flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm">
          <span>Voir détail</span>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default HighlightEventCard;

