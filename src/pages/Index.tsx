import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { mockEvents } from "@/lib/mockData";
import heroImage from "@/assets/hero-event.jpg";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const Index = () => {
  const upcomingEvents = mockEvents
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="Événements élégants"
          width={1920}
          height={800}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-background" />
        <div className="relative z-10 text-center px-4 space-y-6 animate-fade-in">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
            Vivez des moments <br />
            <span className="text-gradient-gold">inoubliables</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Découvrez nos événements exclusifs et réservez votre place en un clic.
          </p>
          <Button
            variant="gold"
            size="lg"
            onClick={() =>
              document.getElementById("events")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Voir les événements <ArrowDown className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Events Grid */}
      <section id="events" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-foreground">
            Événements à venir
          </h2>
          <p className="text-muted-foreground mt-2">
            Sélectionnez un événement pour en savoir plus et vous inscrire.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {upcomingEvents.map((event, i) => (
            <div
              key={event.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
        {upcomingEvents.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            Aucun événement à venir pour le moment.
          </p>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 EventGold. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default Index;
