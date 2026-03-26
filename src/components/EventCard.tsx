import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
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
  const formattedDate = new Date(event.date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link to={`/event/${event.id}`} className="group block">
      <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-52 overflow-hidden">
          <img
            src={image}
            alt={event.title}
            loading="lazy"
            width={800}
            height={600}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <Badge className={`absolute top-3 left-3 ${categoryColors[event.category]} border-0`}>
            {event.category}
          </Badge>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-primary-foreground font-display text-lg font-semibold leading-tight">
              {event.title}
            </p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4 text-gold" />
            <span>{formattedDate} à {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 text-gold" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-gradient-gold font-display text-xl font-bold">
              {event.price.toLocaleString()} {event.currency}
            </span>
            <span className="text-xs text-muted-foreground">
              {event.capacity - event.ticketsSold} places restantes
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
