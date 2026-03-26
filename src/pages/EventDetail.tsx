import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { mockEvents } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowLeft, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const EventDetail = () => {
  const { id } = useParams();
  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl font-bold">Événement introuvable</h1>
          <Link to="/" className="text-gold hover:underline mt-4 inline-block">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const image = event.image || categoryImages[event.category] || eventSoiree;
  const formattedDate = new Date(event.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const remaining = event.capacity - event.ticketsSold;
  const whatsappMessage = encodeURIComponent(
    `Bonjour ! Je souhaite m'inscrire à l'événement "${event.title}" du ${formattedDate}. Merci !`
  );
  const whatsappUrl = `https://wa.me/${event.whatsappNumber.replace("+", "")}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Image */}
      <div className="relative h-[50vh] overflow-hidden">
        <img src={image} alt={event.title} className="w-full h-full object-cover" width={1920} height={800} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-primary-foreground bg-foreground/30 backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-foreground/50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-20 relative z-10 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-8 space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <Badge className="bg-gold text-accent-foreground border-0 mb-3">{event.category}</Badge>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{event.title}</h1>
              </div>
              <div className="text-right">
                <p className="text-gradient-gold font-display text-3xl font-bold">
                  {event.price.toLocaleString()} {event.currency}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <Calendar className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium capitalize">{formattedDate}</p>
                  <p className="text-sm text-muted-foreground">{event.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <MapPin className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-xs text-muted-foreground">Lieu</p>
                  <p className="text-sm font-medium">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <Users className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-xs text-muted-foreground">Places</p>
                  <p className="text-sm font-medium">{remaining} / {event.capacity}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>{event.ticketsSold} inscrits</span>
                <span>{Math.round((event.ticketsSold / event.capacity) * 100)}% rempli</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full gradient-gold rounded-full transition-all duration-500"
                  style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                />
              </div>
            </div>

            <Button variant="gold" size="lg" className="w-full" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                S'inscrire via WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
