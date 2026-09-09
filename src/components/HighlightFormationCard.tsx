import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, Award, Clock } from "lucide-react";
import type { Formation } from "@/lib/api";

interface HighlightFormationCardProps {
  formation: Formation;
}

export const HighlightFormationCard = ({ formation }: HighlightFormationCardProps) => {
  const image = formation.image_url;

  return (
    <Link
      to={`/formation/${formation.slug || formation.id}`}
      className="group bg-white text-[#100906] rounded-2xl sm:rounded-[2rem] border border-black/10 p-2.5 sm:p-5 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1 relative overflow-hidden"
    >
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 right-0 w-28 sm:w-36 h-28 sm:h-36 bg-[#d4af37]/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* IMAGE CONTAINER WITH CIRCULAR BADGE */}
        <div className="relative w-full h-32 sm:h-52 rounded-xl sm:rounded-[1.5rem] overflow-hidden mb-4 sm:mb-6 bg-black/5">
          {image ? (
            <img
              src={image}
              alt={formation.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-[#f4f2ee] flex flex-col items-center justify-center text-[#8c591a] text-[10px] sm:text-xs font-bold uppercase tracking-wider p-2 text-center gap-2">
              <GraduationCap className="w-8 h-8 text-[#8c591a]/50" />
              <span>{formation.title}</span>
            </div>
          )}

          {/* STATUS / CERTIFICATION BADGE TOP-RIGHT */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-black bg-[#d4af37] backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm border border-[#d4af37]/40 font-extrabold">
              {formation.badge || "Certifiant"}
            </span>
          </div>

          {/* CIRCULAR BADGE OVERLAPPING IMAGE */}
          <div className="absolute bottom-[-10px] left-2 sm:bottom-[-14px] sm:left-4 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#100906] text-white border-2 border-[#d4af37] flex flex-col items-center justify-center text-center shadow-lg z-20 shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-[#d4af37]" />
          </div>
        </div>

        {/* CONTENT */}
        <div className="pt-1 px-0.5 sm:px-1">
          <h3 className="font-sans text-xs sm:text-xl font-bold text-[#100906] group-hover:text-[#8c591a] transition-colors line-clamp-2 leading-snug mb-1 sm:mb-2">
            {formation.title}
          </h3>

          <p className="text-[#666] text-[10px] sm:text-xs leading-relaxed line-clamp-2 mb-2 sm:mb-4 font-normal">
            {formation.description || "Formation d'excellence et perfectionnement exécutif dispensée par NFL Courtier & Service."}
          </p>
        </div>
      </div>

      {/* FOOTER ROW & VOIR DÉTAIL BUTTON */}
      <div className="pt-2 sm:pt-3 border-t border-black/5 flex flex-col gap-2 sm:gap-3 px-0.5 sm:px-1 mt-auto">
        <div className="flex items-center justify-between gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[#555] font-medium">
          <div className="flex items-center gap-1 sm:gap-1.5 truncate">
            <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8c591a] shrink-0" />
            <span className="truncate">{formation.certification || formation.level || "Programme Élite"}</span>
          </div>
          {formation.duration && (
            <div className="flex items-center gap-1 text-[10px] text-[#777] shrink-0">
              <Clock className="w-3 h-3 text-[#8c591a]/70" />
              <span>{formation.duration}</span>
            </div>
          )}
        </div>

        {/* BUTTON VOIR DÉTAIL */}
        <div className="w-full bg-[#100906] group-hover:bg-[#8c591a] text-white font-bold rounded-full py-1.5 sm:py-2.5 px-2 sm:px-4 text-[9px] sm:text-xs uppercase tracking-wider transition-colors duration-300 flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm">
          <span>Voir détail</span>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default HighlightFormationCard;
