import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import Footer from "@/components/Footer";
import { mockEvents } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Catalog = () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(0, 0, 0, 0);

  // Filter events: only active or within the 3 days grace period
  const activeEvents = mockEvents
    .filter((e) => new Date(e.date) >= threeDaysAgo)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
            Découvrez l'ensemble des événements prestigieux organisés par NFL Courtier &amp; Service. 
            Réservez vos places dès maintenant.
          </p>
        </div>

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

        {activeEvents.length === 0 && (
          <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-border/50">
            <p className="text-xl text-muted-foreground font-display">Aucun événement disponible pour le moment.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;
