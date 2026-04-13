import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const categoryColors: Record<string, string> = {
  soirée: "bg-gold text-accent-foreground",
  conférence: "bg-primary text-primary-foreground",
  atelier: "bg-brown-light text-primary-foreground",
  concert: "bg-gold-dark text-primary-foreground",
  seminaire: "bg-[#32140c] text-gold",
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
        className="block h-full"
      >
      <div className={`glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col ${isPast ? 'grayscale-[20%] opacity-90' : ''}`}>
        <div className="relative h-52 shrink-0 overflow-hidden">
          <img
            src={image}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-contain bg-muted/30 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={`${categoryColors[event.category]} border-0`}>
              {event.category}
            </Badge>
            {isPast && (
              <Badge variant="destructive" className="border-0">
                Terminé
              </Badge>
            )}
          </div>
          <button
            onClick={handleShare}
            className="absolute top-3 right-3 p-2.5 bg-[#32140c]/80 hover:bg-[#32140c] backdrop-blur-md rounded-full shadow-md text-foreground transition-all duration-300 transform hover:scale-110 z-10 border border-gold/20"
            title="Partager cet événement"
          >
            <Share2 className="h-4 w-4 text-gold shrink-0" />
          </button>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-primary-foreground font-display text-lg font-semibold leading-tight">
              {event.title}
            </p>
          </div>
        </div>
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="h-4 w-4 text-gold shrink-0" />
              <span>{formattedDate}</span>
              <Clock className="h-4 w-4 text-gold shrink-0 ml-2" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 text-gold shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 pt-3 border-t border-border/50 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-gradient-gold font-display text-xl font-bold">
                {event.price.toLocaleString()} {event.currency}
              </span>
              {!isPast && (
                <span className="text-xs text-muted-foreground">
                  {event.capacity - (event.ticketsSold || 0)} places restantes
                </span>
              )}
            </div>
            {isPast ? (
              <Button variant="outline" className="w-full border-gold/30 text-gold hover:bg-gold/10 rounded-xl">
                Voir plus
              </Button>
            ) : (
              <Button variant="gold" className="w-full rounded-xl shadow-lg shadow-gold/20 font-bold group-hover:scale-[1.02] transition-transform">
                Réserver
              </Button>
            )}
          </div>
        </div>
      </div>
      </Link>
    </div>
  );
};

export default EventCard;
