import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { EventsAPI, type Event } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Catalog = () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(0, 0, 0, 0);

  const { data: activeEvents = [], isLoading } = useQuery<Event[]>({
    queryKey: ["upcomingEvents"],
    queryFn: EventsAPI.getUpcoming,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mb-12 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8 group text-sm font-medium">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Retour à l'accueil
          </Link>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Tous nos événements
          </h1>
          <p className="text-muted-foreground text-lg">
            Découvrez les événements en cours de réservation puis suivez le parcours rapide en 3 étapes.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-border/50">
            <p className="text-xl text-muted-foreground font-display">Aucun événement disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeEvents.map((event, i) => (
              <div
                key={event.id}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 100, 1000)}ms` }}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;
