import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/mockData";

import eventSoiree from "@/assets/event-soiree.jpg";
import eventConference from "@/assets/event-conference.jpg";
import eventAtelier from "@/assets/event-atelier.jpg";
import eventConcert from "@/assets/event-concert.jpg";

const categoryImages: Record<string, string> = {
  soirée: eventSoiree,
  conférence: eventConference,
  atelier: eventAtelier,
  concert: eventConcert,
};

const categoryColors: Record<string, string> = {
  soirée: "bg-gold text-accent-foreground",
  conférence: "bg-primary text-primary-foreground",
  atelier: "bg-brown-light text-primary-foreground",
  concert: "bg-gold-dark text-primary-foreground",
};

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const image = event.image || categoryImages[event.category] || eventSoiree;
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  
  // Logic to determine if event is past (yesterday or older)
  const isPast = eventDate < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <Link to={`/event/${event.id}`} className="group block h-full">
      <div className={`glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col ${isPast ? 'opacity-80' : ''}`}>
        <div className="relative h-52 shrink-0 overflow-hidden">
          <img
            src={image}
            alt={event.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isPast ? 'grayscale-[30%]' : ''}`}
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
          <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
            <span className="text-gradient-gold font-display text-xl font-bold">
              {event.price.toLocaleString()} {event.currency}
            </span>
            {!isPast && (
              <span className="text-xs text-muted-foreground">
                {event.capacity - event.ticketsSold} places restantes
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
