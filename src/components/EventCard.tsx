import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Event } from "@/lib/api";

import nflImg1 from "@/assets/nfl img1.jpeg";
import nflImg2 from "@/assets/nfl img2.jpeg";
import nflImg3 from "@/assets/nfl img3.jpeg";
import nflImg4 from "@/assets/nfl img 4.jpeg";

const categoryImages: Record<string, string> = {
  soirée: nflImg1,
  conférence: nflImg2,
  atelier: nflImg3,
  concert: nflImg4,
  seminaire: nflImg2,
};

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const image = event.image_url || event.image || categoryImages[event.category] || nflImg1;
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  
  // Logic to determine if event is past (yesterday or older)
  const isPast = eventDate < new Date(new Date().setHours(0, 0, 0, 0));

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const eventLink = event.slug ? event.slug : event.id;
    const url = `${window.location.origin}/event/${eventLink}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Découvrez cet événement : ${event.title}`,
          url: url,
        });
      } catch (err) {
        console.log("Erreur de partage:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Lien copié dans le presse-papier !");
      } catch (err) {
        toast.error("Impossible de copier le lien.");
      }
    }
  };

  return (
    <div className="group block h-full cursor-pointer relative">
      <Link 
        to={`/event/${event.slug || event.id}`} 
        className="block h-full animate-fade-in"
      >
        <div className={`relative overflow-hidden rounded-[2rem] border border-gold/15 hover:border-gold/45 bg-[#1b0a06]/20 aspect-[4/5] sm:aspect-[3/4] flex flex-col justify-end p-5 sm:p-6 shadow-xl hover:shadow-[0_20px_45px_-15px_rgba(199,157,79,0.15)] transition-all duration-500 h-full ${isPast ? 'grayscale-[10%] opacity-95' : ''}`}>
          
          {/* Background image covering card */}
          <img
            src={image}
            alt={event.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] contrast-[1.05] group-hover:scale-110 group-hover:brightness-[0.8] transition-all duration-700 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent pointer-events-none" />

          {/* Share Button (absolutely positioned top-right) */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 p-2.5 bg-[#32140c]/80 hover:bg-[#32140c] backdrop-blur-md rounded-full shadow-md text-foreground transition-all duration-300 transform hover:scale-110 z-20 border border-gold/20"
            title="Partager cet événement"
          >
            <Share2 className="h-4 w-4 text-gold shrink-0" />
          </button>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10 pr-14">
            <span className="text-[9px] font-black tracking-widest text-gold bg-[#32140c]/90 px-3 py-1 rounded-full border border-gold/20 uppercase">
              {event.category}
            </span>
            {isPast ? (
              <span className="text-[9px] font-black text-[#150805] bg-white border border-white/90 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                Clôturé
              </span>
            ) : (
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-900/50 px-2.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                Disponible
              </span>
            )}
          </div>

          {/* Main Card Content */}
          <div className="relative z-10 space-y-3 w-full">
            
            {/* Title */}
            <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors line-clamp-2 leading-tight">
              {event.title}
            </h3>

            {/* Meta Info */}
            <div className="flex flex-col gap-1 text-white/70 text-[11px] font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>{formattedDate}</span>
                <Clock className="w-3.5 h-3.5 text-gold shrink-0 ml-2" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            {/* Bottom Button / Price info */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-2">
              {!isPast ? (
                <>
                  <span className="text-gold font-black text-sm">
                    {event.price.toLocaleString()} {event.currency}
                  </span>
                  <div className="flex items-center gap-1 text-gold font-bold text-xs group-hover:text-white transition-colors">
                    <span>Réserver</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between w-full text-gold font-bold text-xs group-hover:text-white transition-colors">
                  <span>Revoir les détails</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </div>

          </div>

        </div>
      </Link>
    </div>
  );
};

export default EventCard;
