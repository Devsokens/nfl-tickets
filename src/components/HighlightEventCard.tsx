import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import type { Event } from "@/lib/api";

const MONTHS_FR = ["JANV", "FÉVR", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];

function formatBadgeDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

interface HighlightEventCardProps {
  event: Event;
}

const HighlightEventCard = ({ event }: HighlightEventCardProps) => {
  const image = event.image_url || event.image;
  const isPast = new Date(event.date) < new Date(new Date().setHours(0, 0, 0, 0));

  const formattedDate = formatBadgeDate(event.date);

  return (
    <Link
      to={`/event/${event.slug || event.id}`}
      className="group relative block h-64 rounded-none overflow-hidden border border-white/10 transition-all duration-300 hover:scale-[1.01]"
    >
      {/* TOP BADGES */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
        <span className="text-[10px] font-bold tracking-wider text-black bg-[#b89535] px-2.5 py-1 uppercase rounded-none shadow-sm">
          {formattedDate}
        </span>
        {isPast ? (
          <span className="text-[10px] font-bold tracking-wider text-[#b89535] uppercase">
            Terminé
          </span>
        ) : (
          <span className="text-[10px] font-bold tracking-wider text-black bg-[#b89535] px-2.5 py-1 uppercase rounded-none shadow-sm">
            À venir
          </span>
        )}
      </div>

      {image ? (
        <>
          <img
            src={image}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
          <div className="absolute bottom-0 inset-x-0 p-5">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight mb-1 group-hover:text-[#b89535] transition-colors">
              {event.title}
            </h3>
            <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">
              {event.location}
            </p>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-[#191a1d] flex flex-col items-center justify-center text-center px-6 gap-2">
          <CalendarCheck className="w-9 h-9 text-[#b89535]" strokeWidth={1.5} />
          <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight group-hover:text-[#b89535] transition-colors mt-2">
            {event.title}
          </h3>
          <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">
            {event.location}
          </p>
        </div>
      )}
    </Link>
  );
};

export default HighlightEventCard;

