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
      className="group bg-white rounded-[2rem] border border-black/10 p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1"
    >
      <div>
        {/* IMAGE CONTAINER WITH CIRCULAR DATE BADGE */}
        <div className="relative w-full h-48 sm:h-52 rounded-[1.5rem] overflow-hidden mb-6 bg-[#100906]/5">
          {image ? (
            <img
              src={image}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-[#100906] flex items-center justify-center text-white/50 text-xs font-bold uppercase tracking-wider">
              {event.title}
            </div>
          )}

          {/* STATUS BADGE TOP-RIGHT */}
          <div className="absolute top-3 right-3 z-10">
            {isPast ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                Terminé
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#100906]/80 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-white/20">
                À venir
              </span>
            )}
          </div>

          {/* CIRCULAR DATE BADGE (OVERLAPPING BOTTOM LEFT - EXACT REFERENCE MAQUETTE) */}
          <div className="absolute bottom-[-14px] left-4 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#100906] text-white border-2 border-white flex flex-col items-center justify-center text-center shadow-lg z-20 shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#d4af37] leading-none">
              {month}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-white leading-tight">
              {day}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="pt-1 px-1">
          <h3 className="font-sans text-lg sm:text-xl font-bold text-[#100906] group-hover:text-[#8c591a] transition-colors line-clamp-2 leading-snug mb-2">
            {event.title}
          </h3>

          <p className="text-[#666] text-xs leading-relaxed line-clamp-2 mb-4 font-normal">
            {event.description || "Rejoignez-nous pour cet événement d'exception organisé par NFL Courtier & Service."}
          </p>
        </div>
      </div>

      {/* FOOTER ROW & VOIR DÉTAIL BUTTON */}
      <div className="pt-3 border-t border-black/5 flex flex-col gap-3 px-1 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-[#666] font-medium truncate">
          <MapPin className="w-3.5 h-3.5 text-[#8c591a] shrink-0" />
          <span className="truncate">{event.location || "Libreville, Gabon"}</span>
        </div>

        {/* BUTTON VOIR DÉTAIL */}
        <div className="w-full bg-[#100906] group-hover:bg-[#8c591a] text-white rounded-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm">
          <span>Voir détail</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default HighlightEventCard;

